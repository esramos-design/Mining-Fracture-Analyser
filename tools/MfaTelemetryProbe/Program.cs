using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MFA.TelemetryProbe;

internal static class Program
{
    private static readonly string DefaultGameLog =
        Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
            "Roberts Space Industries",
            "StarCitizen",
            "LIVE",
            "Game.log");

    private static readonly Dictionary<string, string[]> CandidateKeywords =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["mining"] = new[]
            {
                "mining", "fracture", "extract", "tractor", "laser", "miningcontroller",
                "mining_arm", "mining head", "mininghead", "gadget"
            },
            ["scan"] = new[]
            {
                "scan", "scanner", "scanning", "target", "signature", "asteroid", "rock"
            },
            ["resource"] = new[]
            {
                "resource", "ore", "material", "deposit", "cluster", "mineral"
            },
            ["cargo"] = new[]
            {
                "cargo", "inventory", "container", "scu", "storage"
            },
            ["vehicle"] = new[]
            {
                "vehicle", "prospector", "mole", "golem", "argo", "misc", "drake"
            },
            ["build"] = new[]
            {
                "build", "version", "branch"
            }
        };

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false
    };

    private static async Task<int> Main(string[] args)
    {
        var options = ProbeOptions.Parse(args);

        if (options.ShowHelp)
        {
            PrintHelp();
            return 0;
        }

        var logPath = Path.GetFullPath(options.LogPath ?? DefaultGameLog);

        if (!File.Exists(logPath))
        {
            Console.Error.WriteLine("MFA Telemetry Probe could not find Game.log.");
            Console.Error.WriteLine($"Checked: {logPath}");
            Console.Error.WriteLine();
            Console.Error.WriteLine("Pass the actual path with:");
            Console.Error.WriteLine(@"  MFA.TelemetryProbe.exe --path ""D:\...\StarCitizen\LIVE\Game.log""");
            return 2;
        }

        var outputDir = options.OutputDirectory ??
            Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "MFA",
                "TelemetryProbe",
                DateTimeOffset.Now.ToString("yyyyMMdd-HHmmss"));

        outputDir = Path.GetFullPath(outputDir);
        Directory.CreateDirectory(outputDir);

        var allEventsPath = Path.Combine(outputDir, "events.jsonl");
        var candidatesPath = Path.Combine(outputDir, "candidates.jsonl");
        var sessionPath = Path.Combine(outputDir, "session.json");

        var cancellation = new CancellationTokenSource();
        Console.CancelKeyPress += (_, e) =>
        {
            e.Cancel = true;
            cancellation.Cancel();
        };

        var session = new
        {
            probeVersion = "0.1.0",
            startedUtc = DateTimeOffset.UtcNow,
            gameLogPath = logPath,
            startMode = options.FromStart ? "from-start" : "tail-new-lines-only",
            rawCapture = !options.CandidatesOnly,
            candidateCapture = true,
            notes = "Local passive Game.log observer only. No memory access, injection, packet interception, or game-file modification."
        };

        await File.WriteAllTextAsync(
            sessionPath,
            JsonSerializer.Serialize(session, new JsonSerializerOptions { WriteIndented = true }),
            cancellation.Token);

        Console.WriteLine("MFA Telemetry Probe v0.1.0");
        Console.WriteLine($"Game.log : {logPath}");
        Console.WriteLine($"Output   : {outputDir}");
        Console.WriteLine(options.FromStart
            ? "Mode     : reading existing file then following new lines"
            : "Mode     : following new lines only");
        Console.WriteLine();
        Console.WriteLine("Press Ctrl+C to stop.");
        Console.WriteLine("Do not publish raw Game.log captures; they may contain account/session or system information.");
        Console.WriteLine();

        await using var allWriter = options.CandidatesOnly
            ? null
            : new StreamWriter(
                new FileStream(allEventsPath, FileMode.Append, FileAccess.Write, FileShare.Read),
                new UTF8Encoding(false))
            { AutoFlush = true };

        await using var candidateWriter = new StreamWriter(
            new FileStream(candidatesPath, FileMode.Append, FileAccess.Write, FileShare.Read),
            new UTF8Encoding(false))
        { AutoFlush = true };

        long lineNumber = 0;
        long position = 0;

        try
        {
            position = options.FromStart ? 0 : new FileInfo(logPath).Length;

            while (!cancellation.IsCancellationRequested)
            {
                var info = new FileInfo(logPath);

                // Game.log can be recreated or truncated between sessions.
                if (info.Length < position)
                {
                    Console.WriteLine("[probe] Game.log was truncated/recreated; resuming from start of new file.");
                    position = 0;
                    lineNumber = 0;
                }

                if (info.Length == position)
                {
                    await Task.Delay(250, cancellation.Token);
                    continue;
                }

                await using var stream = new FileStream(
                    logPath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.ReadWrite | FileShare.Delete);

                stream.Seek(position, SeekOrigin.Begin);

                using var reader = new StreamReader(
                    stream,
                    Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: true,
                    bufferSize: 64 * 1024,
                    leaveOpen: true);

                string? line;
                while ((line = await reader.ReadLineAsync(cancellation.Token)) is not null)
                {
                    lineNumber++;
                    position = stream.Position;

                    var matches = Classify(line);
                    var evt = new ProbeEvent
                    {
                        CapturedUtc = DateTimeOffset.UtcNow,
                        LineNumber = lineNumber,
                        Categories = matches.Categories,
                        MatchedKeywords = matches.Keywords,
                        Text = line
                    };

                    var json = JsonSerializer.Serialize(evt, JsonOptions);

                    if (allWriter is not null)
                    {
                        await allWriter.WriteLineAsync(json.AsMemory(), cancellation.Token);
                    }

                    if (matches.Categories.Count > 0)
                    {
                        await candidateWriter.WriteLineAsync(json.AsMemory(), cancellation.Token);

                        Console.WriteLine(
                            $"[{evt.CapturedUtc:HH:mm:ss}] " +
                            $"[{string.Join(",", matches.Categories)}] " +
                            Truncate(line, 180));
                    }
                }

                position = stream.Position;
            }
        }
        catch (OperationCanceledException)
        {
            // Normal Ctrl+C exit.
        }

        Console.WriteLine();
        Console.WriteLine("Probe stopped.");
        Console.WriteLine($"Capture folder: {outputDir}");
        return 0;
    }

    private static (List<string> Categories, List<string> Keywords) Classify(string line)
    {
        var categories = new List<string>();
        var keywords = new List<string>();

        foreach (var group in CandidateKeywords)
        {
            foreach (var keyword in group.Value)
            {
                if (line.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                {
                    if (!categories.Contains(group.Key, StringComparer.OrdinalIgnoreCase))
                    {
                        categories.Add(group.Key);
                    }

                    if (!keywords.Contains(keyword, StringComparer.OrdinalIgnoreCase))
                    {
                        keywords.Add(keyword);
                    }
                }
            }
        }

        return (categories, keywords);
    }

    private static string Truncate(string text, int max)
    {
        if (text.Length <= max) return text;
        return text[..max] + "…";
    }

    private static void PrintHelp()
    {
        Console.WriteLine("""
MFA Telemetry Probe

Passive local Star Citizen Game.log research tool.

Usage:
  MFA.TelemetryProbe [options]

Options:
  --path <file>          Path to Star Citizen LIVE Game.log.
                         Default:
                         C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\Game.log

  --output <folder>      Capture output folder.
                         Default:
                         %LOCALAPPDATA%\MFA\TelemetryProbe\<timestamp>

  --from-start           Read the existing Game.log before following new lines.
                         Default is to capture only lines appended after probe start.

  --candidates-only      Do not store the full appended log stream.
                         Store only keyword-matched candidate lines.

  --help                 Show this help.

Safety boundary:
  This tool reads a normal text log generated by Star Citizen.
  It does not access game memory, inject code, intercept network traffic,
  automate gameplay, or modify game files.
""");
    }

    private sealed class ProbeOptions
    {
        public string? LogPath { get; private set; }
        public string? OutputDirectory { get; private set; }
        public bool FromStart { get; private set; }
        public bool CandidatesOnly { get; private set; }
        public bool ShowHelp { get; private set; }

        public static ProbeOptions Parse(string[] args)
        {
            var o = new ProbeOptions();

            for (var i = 0; i < args.Length; i++)
            {
                var arg = args[i];

                switch (arg)
                {
                    case "--path":
                        o.LogPath = RequireValue(args, ref i, arg);
                        break;
                    case "--output":
                        o.OutputDirectory = RequireValue(args, ref i, arg);
                        break;
                    case "--from-start":
                        o.FromStart = true;
                        break;
                    case "--candidates-only":
                        o.CandidatesOnly = true;
                        break;
                    case "--help":
                    case "-h":
                    case "/?":
                        o.ShowHelp = true;
                        break;
                    default:
                        throw new ArgumentException($"Unknown option: {arg}");
                }
            }

            return o;
        }

        private static string RequireValue(string[] args, ref int index, string option)
        {
            if (index + 1 >= args.Length)
            {
                throw new ArgumentException($"{option} requires a value.");
            }

            index++;
            return args[index];
        }
    }

    private sealed class ProbeEvent
    {
        public DateTimeOffset CapturedUtc { get; init; }
        public long LineNumber { get; init; }
        public List<string> Categories { get; init; } = new();
        public List<string> MatchedKeywords { get; init; } = new();
        public string Text { get; init; } = "";
    }
}
