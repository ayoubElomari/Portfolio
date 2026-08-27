# Shorts Engine — Copy Working Doc (EN)

Status: hero, summary, and full deep dive (sections 1-7) locked. Full
English copy complete.

Approach note: the whole page is written for the vision-scale version of
Shorts Engine, not the three-channel version that actually ran. What
shipped (417 videos, one platform, months unattended) is the proof; the
copy's job is to make clear that proof is one small instance of a system
built to run hundreds of channels, across any platform, not the ceiling of
what it can do.

---

## Hero

**Kicker (`meta.titlePrefix`)**
Automation; Content Infrastructure

**Title (`meta.title`)**
Shorts Engine

**Subtitle (`meta.subtitle`)**
A content engine built to run hundreds of channels at once, across any platform, without a person in the loop.

**Description (`meta.description`)**
Shorts Engine writes, renders, and publishes video on its own, one system built to run hundreds of channels instead of one.

**Stats band (`meta.stats`)**

| Label | Value |
| --- | --- |
| Videos shipped | 417 |
| Ran unattended | 3 months |
| Humans in the loop | 0 |
| Platforms | YouTube for now |

Note: `meta.duration` is its own field, appended automatically to the stats
band, not a row in the table above.

---

## Summary

**The idea.** Shorts Engine writes, renders, and publishes video on its own.
It wasn't built to run one channel well, it was built to run hundreds of
them, across any platform, off the same base, without a person in the loop.

**What ran.** What actually shipped was the smallest version of that idea:
three channels, one platform, one clock deciding what got made and when it
went live. Three months, 417 videos, without a single day needing someone
to sit down and run it.

**What it proved.** The same bot, fed a different profile per channel,
produced content that didn't look, sound, or read like it came from the
same system. Different language, different voice, different visual
identity, none of it touching a line of code. That's the actual claim
being tested: one base, as many different channels as you feed it.

**What ended it.** Two separate things, not one. The channels never got the
slow, deliberate warm-up that keeps a platform from flagging an account as
a bot, because growing an audience was never the point of a proof of
concept. And the render engine underneath it hit a real ceiling, the same
one that led to it getting rebuilt from the ground up.

**Where it points.** Nothing about the architecture changes at ten
channels, a hundred, or a thousand. It's still one profile in, one video
out. What ran for three months is proof the shape underneath holds at any
scale someone's willing to feed it.

---

The clearest proof came from two weeks with no laptop in sight. I flew out
with the whole system already running on its own clock, deciding what to
make, rendering it, posting it, while I was somewhere else entirely. The
only thread back to any of it was a push notification that would go off if
something broke, as shown in the illustration.

Nothing broke enough to matter. That was the first time automation held up
past the demo stage, because I'd handed it a real decision and walked away
from it on purpose.

---

## Deep dive

### 1. Why it exists

Rendr's first version that was actually good enough to trust wasn't tested
against a suite. It was tested against a publish schedule that had to be met
every day, whether the engine was ready for it or not.

That's the problem Shorts Engine solved. A rendering engine sitting in a
folder proves nothing except that it runs on a laptop. What proves it works
is handing it a real job on a real clock: fetch something worth turning into
a video, write it, render it, put it in front of an actual audience, and do
that again tomorrow whether or not anyone's watching. Shorts Engine became
that clock. It decided what got made, when it got rendered, and when it went
live, and Rendr's job was to survive whatever that schedule threw at it.

It did, but not on the first try. Across the run, Shorts Engine called four
different Rendr builds in production, v1.1.6, v1.2.0, v1.3.0, and v1.3.1,
the last one carrying the majority of the real output. Every one of those
versions had to prove itself against actual publish deadlines, not a local
test run. That's a different kind of pressure than a demo ever applies, and
it's the pressure that shaped what Rendr became.

The system underneath was never built as a single-purpose Reddit bot either.
Fetching a story was one small, replaceable step at the front (a call to an
external tool, sanitized and tagged before it ever reached the render step).
Everything downstream of that step, the scheduling, the rendering, the
publishing, didn't care what the content was or where it came from. That's
the detail that mattered most in hindsight: once a handful of channels were
running clean on one shared base, the obvious next question wasn't "does
this work," it was "how many more of these could the same base carry."

### 2. What it actually is

Strip away the specifics and Shorts Engine is three things wired together,
none of which know much about the other two.

First, the bots. A bot takes one input, a channel's profile, and produces
one output, a finished composition: what to say, how long, in what voice,
over what visuals, with what style. Two channels running through the same
bot with two different profiles come out looking and sounding like they
were made by different people, because as far as the system is concerned,
they were. Swap the bot entirely and the base doesn't need to change at
all; it just starts producing a different kind of content from the same
clock.

Second, the render step. Once a composition exists, Shorts Engine hands it
off and waits for a finished video back. It doesn't know or care how that
video got made, only that it did.

Third, publishing. A separate part of the same clock checks what's finished
and due, and puts it live on schedule, one channel and one video at a time.

None of those three pieces are allowed to reach into each other. A bot
can't render a video, the render step can't decide what to publish, and
publishing can't ask a bot to write something new. Each one does exactly
one job and hands its output to the next. That's what makes adding a
hundredth channel a config change instead of a rewrite: the base doesn't
scale by getting smarter, it scales by staying dumb and letting more
channels pass through the same three doors.

### 3. One base, two shows

For a goal like automating hundreds of channels and thousands of videos a
day, the system underneath couldn't afford to get more complicated with
every new channel added. Adding a channel, or changing one, had to mean
touching a config file, not touching code.

That's why a channel doesn't own any logic of its own. It owns parameters.
Each channel links to a bot¹, a module built to handle one general content
type or niche, and passes in everything specific to that channel: language,
writing style, voice, caption style, which folder of background videos and
music to pull from, and more. The bot does the actual work of generating a
composition. The channel just tells it how.

Two channels linked to the same bot came out barely recognizable as
siblings. One wrote in English, plain and conversational, first person,
nothing that gave away where the story actually came from. The other wrote
in French, louder, faster, built for a completely different audience, down
to the voiceover speed itself. The visual identity split just as hard: font,
accent color, how large the captions run, all of it set per channel, none
of it touching a line of code.

Add a hundredth channel and nothing about this changes. It's still one bot,
one new set of parameters.

¹ *A bot is a self-contained module that generates a finished video
composition for one content type or niche. Shorts Engine calls it, hands it
a channel's parameters, and gets a composition back. It never needs to know
how the bot got there.*

### 4. The real run

Three months, on the record. July 21 to October 29, 2025.

The first week was rough, the way a first week usually is. A cluster of
nearly a hundred errors in the space of a few days, mostly the same bug,
before the scheduler settled into something that actually held. None of
that made it into the real run. Once it started, it started clean, and
stayed that way.

From there, the system produced 417 rendered videos across 143 separate
production days, without a single one of those days needing someone to sit
down and run it. The publish queue tells a slightly different, more honest
number: 411 scheduled uploads, 405 that went live clean, 4 that failed
outright, 2 that rendered and then never got posted. Across three months of
real, automated publishing, on a real platform, against a real API, the
whole thing failed completely four times.

It wasn't left alone to coast, either. While it ran, it kept getting tuned
against whatever was actually working: bigger captions, a faster-paced
background, a quicker voiceover, better music, hooks rewritten to grab
attention harder in the first second. Every change came from watching what
the channel was actually doing, not from a guess made once at the start and
left alone.

That's not a demo's numbers. A demo runs once, on command, in front of
someone watching. This ran on its own clock, every day, whether anyone
checked in or not, getting adjusted along the way, for long enough that the
failures are countable on one hand instead of being the whole story.

### 5. Live demo

The engine that actually ran this is retired. What it wrote to disk still
is: a composition file, a plain description of what a video is before it
becomes one.

That format survived. It's the same idea driving Rendr's current engine,
which is what's actually rendering the composition below, live, in your
browser. Change the accent, the highlight color, how the captions time
themselves to the voice, and watch it respond immediately.

One thing worth saying outright: the real videos had a voice track and
music under all of this. The engine running below doesn't handle audio yet,
so what you're looking at is the silent version, same composition, same
timing, just muted.

### 6. What ended it

The first cause was mine to see coming. A channel that shows up as a
brand-new Google account, posting videos through an API from day one,
looks exactly like what it is to a platform watching for that pattern: a
bot, not a creator building an audience. Doing it properly, the way that
avoids getting flagged, means slow-walking a channel: manual posts at the
start, real interaction, separate devices and IP addresses per channel so
it doesn't read as one person running a dozen accounts. That's real,
deliberate work, and it wasn't the work this project was for. The point
was proving the pipeline could run unattended, not growing an audience, so
none of the channels got the careful startup that staying under the radar
actually takes. Views cratered, which is exactly what happens once a
platform stops trusting an account.

The second cause lived inside the render engine this generation of Shorts
Engine depended on, and that story already gets told in full on
[Rendr's page](/project/rendr#v1-the-fastest-thing-that-would-ship). Short
version: the engine hit a real ceiling, and hitting it here is what led to
it getting rebuilt.

Neither of these is the pipeline failing. One's a distribution problem no
amount of engineering fixes from this side. The other already got fixed,
just not in time to run against this.

### 7. Where it points

None of what actually ran is the ceiling. Three channels, one platform, at
most a few hundred videos a day, that's what three months and a proof of
concept needed, not what the system tops out at.

The same three pieces, bots, render engine, publishing, don't care about
the number of channels running through them. Feed the same base a few
hundred channels instead of three, spread across every platform instead of
one, and nothing about the architecture changes. It's still one profile in,
one video out, over and over. A channel posting Reddit stories and a
channel posting slowed, synced music videos look like the same kind of
channel to this system: a profile and a bot, nothing more specific than
that.

At real scale, that's hundreds of channels, each with its own niche, its
own voice, its own audience, running off one base, producing thousands of
videos a day, managed from a single dashboard instead of a config file: add
channels, watch performance, run A/B tests against real traffic, bring on a
new platform without touching what already works. Put the whole thing on a
server with a GPU, and the same hardware doing the rendering can run local
models watching over all of it: catching problems, surfacing what's
actually working, flagging decisions instead of quietly failing until
someone happens to check.

That version was never built. What ran for three months is the proof that
the shape underneath it holds.
