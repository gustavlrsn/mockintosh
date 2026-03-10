- LLM's accessing tools like
- readfile (from OPFS)

### sandbox

### dev containers

easy development. quick way to "build a 1-bit mockintosh app"

### figure out the OS layer vs "company services"

### refactor

The app code is too messy. I need to define a format that is easier to understand.

- classes rather than React style useState and useRef?

- web OS examples
  - https://manual.os-js.org/resource/overview/
- unix to the browser

  - https://github.com/plasma-umass/browsix
  - run processes as web workers

- Should compare the API's of

  - Pixi.js
  - Phaser
  - Konva

- Decker

  - https://github.com/JohnEarnest/Decker?tab=readme-ov-file
  - https://beyondloom.com/blog/sketchpad.html
  - The most interesting thing here I think.
  - DeckerOS?
  - Compatible with Decker file format?
  - Decker as an application, "Decker-Mockintosh".
  - Publish Decks as applications in the app store?
    - Decker packager => locked decks into the App store?

# links

- https://breadboards.io/
  - modern hypercard?
- https://archives.somnolescent.net/web/mari_v2/junk/hypercard/?utm_source=hackernewsletter&utm_medium=email&utm_term=design
- https://news.ycombinator.com/item?id=47281485&utm_term=comment
- https://arcade.pirillo.com/fontcrafter.html
- https://ankursethi.com/blog/programming-language-claude-code/
- https://news.ycombinator.com/item?id=47353957&utm_term=comment
- https://madalitso.me/notes/why-everyone-is-talking-about-filesystems/?utm_source=hackernewsletter&utm_medium=email&utm_term=fav

  ## Game. Myst-inspired? Based on the 1984 commercial from Apple. Like, rage against the machine. AI-themed.

  ### Story

  It's 2034. 50 years after apple introduced the macintosh. The AI has taken over in cahoots with an elite. Most people are automatons. You're part of the resistance.

  You're relegated to using old vintage computer hardware since every new chip has built-in connectivity to the AI, it's unclear whehter the AI did that or not. Most computers know everything you're doing. Resistance hackers has built applications for the vintage computers, and added README's for how to use various tools, like "Safari" that has a hack script to fake the biometric ID check (which is something like a 2fa key but using your biometrics, like a blood sample) (maybe loaded through a floppy?)

  The open and free internet as we know it has been shut down, the version that is still there, is heavily censored and not anonymous. To log on you have to provide your government biometric ID.

  You still have access to an curated internet archive from 2030, where people who were woke to what was going on, started to save things they deemed interesting for survival, history preservation and collecting evidence for what they deemed was 'crimes against humanity'. You have this archive running locally on `localhost:`

  There is a p2p network that is called Meshtastic, used by the resistance, but the AI is actively trying to catfish you.

  You need to identify the others.

  The hopeful and scary part at the same time is that the elite that is still supporting the AI takeover, are complete tech idiots.

  ### Elements

  - mesh LLM: an unaffected LLM that is running on a decentralized p2p network, thanks to advances in model size and efficiency, you can run this on your vintage hardware.

  ### Game mechanics

  - options
    - storyline to complete?
    - open-ended, i.e. build new apps, chat with others, build new websites?

  ### Monetization

  - in app purchase of some kind of access, like buying tokens for a mesh-based unconnected (unaffected LLM?)
