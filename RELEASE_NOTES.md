<!-- Release notes for the first GitHub Release of fire17/icy-tower-roadster.
     Checksums below match out/dist as of the FINAL pass.
     Re-run `shasum -a 256 out/dist/*.zip` if either zip is rebuilt. Delete this comment before pasting. -->

# Icy Tower: Roadster Edition

Harold's tower has a new climber: the 2026 Tesla Roadster. It backflips up the floors on cold-gas thrusters that fire from where the real car's nozzles are.

A free, non-commercial fan edition of **Icy Tower 1.3 © Johan Peitz / Free Lunch Design** — https://www.freelunchdesign.com

**Play in the browser (any device):** https://icytower.akeyo.io/play/

## Downloads

| File | For | First launch |
|---|---|---|
| `Icy-Tower-Roadster-mac.zip` (11.1 MB) | Mac with Apple Silicon (M1 or newer), macOS 13 Ventura or newer | Unzip, drag to Applications, then right-click the app → **Open** → **Open**. On macOS 15 or newer, if there's no Open button: System Settings → Privacy & Security → **Open Anyway**. |
| `Icy-Tower-Roadster-windows.zip` (13.5 MB) | Windows 10 or 11, 64-bit | Right-click → Extract All, run the game. If SmartScreen says "Windows protected your PC": **More info** → **Run anyway**. |

macOS and Windows ask once because the apps are not notarized or code-signed. That costs money, and this project takes none.

## What's in it

- **The Roadster as a playable character.** Original pixel art, 64 pre-rendered flip angles, ice-cyan cold-gas jets from the real nozzle layout: 4 rear main, 4 lift jets near the wheels, 2 nose laterals.
- **The original game, faithfully.** Every platform runs the same C core, transcribed from Icy Tower 1.3.1.
  - Mac: 16/16 of the original game's replays reproduce their recorded score, floor and combo.
  - Windows: 16/16, tick for tick.
  - Web: 16/16, tick for tick.
  - All three: 145,141 per-tick full-state hashes, identical on Mac, Windows and Web (combined chain `ce0ab7382a9dd329`).
- **Four climbers:** the Roadster (the default), Harold, Disco Dave and the Template. Press C to switch. Every new game starts on the classic ice floors.
- **Same keys as 2001:** ← → run, Space jump, Esc pause, R restart, M mute.

## Checksums (sha256)

```
53d4f432c336d764885570ef78c4c3aca20f28fb90631288e26b844d5dbc1b96  Icy-Tower-Roadster-mac.zip
6b6c8ef94b2b4c6e7acc4840174499f9d866d601682120f316efa9b9a5564bc2  Icy-Tower-Roadster-windows.zip
```

## Credits

Icy Tower was written, designed and drawn by Johan Peitz, with music and sound effects by Anders Svensson. It is freeware by Free Lunch Design (https://www.freelunchdesign.com). Everything from Icy Tower stays theirs. This edition is free, has no ads and no tracking, and is never sold or bundled. If you are from Free Lunch Design and want something changed or taken down, open an issue and it will be done.

Tesla and Roadster are trademarks of Tesla, Inc., and SpaceX is a trademark of Space Exploration Technologies Corp. This is an unaffiliated fan project. Full notices are in [CREDITS.md](https://github.com/fire17/icy-tower-roadster/blob/main/CREDITS.md).
