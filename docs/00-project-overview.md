# Z Browser — Project Overview

> **Codename:** Z Browser
> **Type:** Custom Desktop Web Browser
> **Platform:** Desktop
> **License:** Open Source
> **Primary Stack:** Electron, Chromium, TypeScript
> **Architecture:** Electron Main Process + WebContentsView-based web rendering

---

## 1. What Are We Building?

**Z Browser** is a custom desktop browser shell built around the Chromium browser engine using **Electron and TypeScript**.

Rather than implementing a web browser engine from scratch, Z Browser uses Chromium for the complex underlying browser responsibilities such as rendering modern web applications, while our application provides the browser shell, interaction model, user interface, state management, and custom functionality surrounding it.

The architecture uses Electron's modern **`WebContentsView`** approach for displaying and managing web content. This allows Z Browser to maintain a clear separation between the custom browser interface and the Chromium-powered web pages rendered inside the application.

At a high level:

```text
┌───────────────────────────────────────────────────────┐
│                     Z BROWSER                         │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Custom Browser Shell               │  │
│  │                                                 │  │
│  │  Tabs • Navigation • Omnibox • Commands • UI   │  │
│  └─────────────────────────────────────────────────┘  │
│                         │                             │
│                    Electron API                       │
│                         │                             │
│  ┌──────────────────────┴──────────────────────────┐  │
│  │                  WebContentsView                │  │
│  │                                                 │  │
│  │             Chromium Web Content                │  │
│  │                                                 │  │
│  │       HTML • CSS • JavaScript • Websites        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
└───────────────────────────────────────────────────────┘
```

The fundamental principle is:

> **Chromium handles the web. Z Browser handles the browsing experience.**

This distinction allows the project to focus on browser architecture, application design, interaction design, security, and experimentation without attempting to recreate an entire browser engine.

---

## 2. Why Are We Building It?

Z Browser is being built as both a **technical learning project** and a serious open-source application.

The primary objective is not simply to make a browser that works. The development process is intended to provide a deep understanding of how the different layers of a modern desktop browser application interact.

### Technical Learning Goals

The project will be used to develop practical understanding of:

* Browser architecture
* Chromium integration
* Electron application architecture
* Electron's main and renderer processes
* `WebContentsView`
* Inter-process communication (IPC)
* Preload scripts
* Context isolation
* Renderer security boundaries
* Browser state management
* Desktop UI engineering
* Multi-process application design
* Navigation and web-content lifecycle
* Secure communication between application components

Each major system will be documented as it is implemented.

The documentation is therefore considered part of the project itself, rather than something that will be written only after development is finished.

### Building Something Real

The second objective is to produce a **fully functional and genuinely useful desktop browser application**.

Z Browser should eventually be more than an educational Electron demo. It should be a coherent application with:

* A complete core browsing experience
* A distinctive visual identity
* A unique interaction model
* Power-user functionality
* A well-defined architecture
* Clear technical documentation
* A maintainable codebase

### Open Source and Portfolio Value

Z Browser is also intended to become a significant open-source project and portfolio piece.

The project demonstrates the ability to work across multiple areas of software engineering rather than focusing on a single isolated technology.

It combines:

```text
TypeScript
    ↓
Application Architecture
    ↓
Electron
    ↓
Chromium Integration
    ↓
IPC & Security
    ↓
UI Engineering
    ↓
Browser Architecture
    ↓
Power-User Features
```

The goal is to create something that can be examined, understood, extended, and used by other developers.

---

# 3. What Must It Do?

Before experimental features are introduced, Z Browser must provide a solid core browsing experience.

The browser shell should provide the fundamental functionality users expect from a desktop browser.

## 3.1 Multi-Tab Management

Z Browser must support multiple browser tabs.

The tab system will be responsible for:

* Creating tabs
* Closing tabs
* Switching between tabs
* Tracking the active tab
* Maintaining independent web contents for each tab
* Associating browser state with individual tabs

Each tab will ultimately correspond to a managed web-content instance.

The architecture should allow the tab system to evolve later into more advanced layouts such as tiled and split views.

---

## 3.2 Navigation

Z Browser must provide standard browser navigation controls:

* Back
* Forward
* Refresh
* Page loading
* Navigation state updates

Navigation actions must operate on the active web-content instance rather than directly manipulating the browser UI.

The shell should also react to navigation state so that controls and displayed information remain synchronized with the active page.

---

## 3.3 Omnibox

The browser will provide a functional **omnibox**, combining URL entry and search functionality into a single interface.

The omnibox should be capable of accepting:

```text
https://example.com
```

as well as ordinary search queries such as:

```text
how does chromium rendering work
```

The browser will determine whether the input represents a URL or a search query and handle it accordingly.

The omnibox will eventually become more than a simple URL field because it is also the primary entry point for Z Browser's command-driven interface.

---

## 3.4 Secure Application Architecture

Security is a core architectural requirement rather than an optional enhancement.

Z Browser will use Electron's security mechanisms to maintain a separation between application code and untrusted web content.

The intended architecture includes:

* Context isolation
* Preload scripts
* No direct Node.js integration inside the web renderer
* Controlled IPC communication
* Clear trust boundaries between browser UI and websites

The principle is:

```text
Trusted Application
       │
       │ Controlled IPC
       ▼
Preload / Bridge
       │
       ▼
Renderer / Web Content
       │
       ▼
Untrusted Websites
```

Web pages should not receive unrestricted access to the application's Node.js environment.

Security decisions will be documented as the architecture evolves.

---

# 4. What Makes It Z Browser?

A functional browser alone does not define the project.

Z Browser's identity comes from deliberately contrasting the modern web with an unconventional browser shell.

The project has two major identity pillars:

1. **Retro Desktop UI**
2. **Linux / CLI-first interaction**

---

## 4.1 Retro UI Design

Z Browser will use a nostalgic **classic desktop-computing aesthetic** for its browser shell.

The visual language draws inspiration from interfaces such as:

* Windows 95-era desktop applications
* Classic terminal interfaces
* Early desktop utilities
* Old-school system software

The objective is not to recreate an existing operating system interface pixel-for-pixel.

Instead, the design will reinterpret the visual language of classic desktop computing into a modern browser application.

### Visual Contrast

One of the defining ideas behind Z Browser is the contrast between:

```text
┌───────────────────────────────────────┐
│         RETRO Z BROWSER SHELL         │
│                                       │
│  [TAB] [TAB] [TAB]   [ OMNIBOX ]     │
├───────────────────────────────────────┤
│                                       │
│                                       │
│          MODERN WEB PAGE              │
│                                       │
│       Chromium-rendered content       │
│                                       │
└───────────────────────────────────────┘
```

The browser chrome intentionally feels like an older generation of computing while the web pages themselves remain completely modern.

This creates a deliberate visual separation:

> **Old-school computer interface surrounding the modern web.**

---

# 4.2 Linux Mode — CLI-Driven Browsing

The second major identity feature is **Linux Mode**.

Linux Mode is a command-palette and terminal-first interaction model designed for power users who prefer keyboard-driven workflows.

Instead of requiring the mouse for every browser operation, users can interact with the browser through custom commands.

Example commands include:

```text
:open https://example.com
:tab new
```

The command interface will eventually provide control over browser functionality such as:

* Opening URLs
* Creating tabs
* Closing tabs
* Switching tabs
* Navigation
* Searching
* Browser commands
* Configuration
* Custom aliases

The goal is to make Z Browser feel less like a conventional graphical browser and more like a **command-driven desktop environment built around Chromium**.

### Example Interaction

```text
┌───────────────────────────────────────────────┐
│ Z Browser                                     │
├───────────────────────────────────────────────┤
│                                               │
│ > :tab new                                    │
│                                               │
│ Tab created                                   │
│                                               │
│ > :open example.com                           │
│                                               │
│ Opening example.com                            │
│                                               │
└───────────────────────────────────────────────┘
```

The command interface should coexist with conventional browser controls rather than making mouse-based interaction mandatory.

This allows users to choose between:

```text
Traditional UI
       │
       ├── Mouse
       ├── Buttons
       └── Tabs
       
          OR

Linux Mode
       │
       ├── Keyboard
       ├── Commands
       └── Command Palette
```

---

# 5. What Are We Experimenting With?

Once the core browser architecture is stable, Z Browser will expand into more experimental territory.

These features are intended to test how far a browser shell can be customized when the underlying Chromium engine is treated as a rendering platform rather than as the entire user experience.

The following Phase 2 milestones are already part of the architectural direction.

---

## 5.1 i3-Style Tiling Layouts

Z Browser will experiment with dynamic tiled layouts inspired by tiling window managers such as i3.

Instead of restricting users to a traditional tab-only model, multiple web views could occupy the browser window simultaneously.

For example:

```text
┌─────────────────────────────────────────────┐
│ Z Browser                                   │
├──────────────────────┬──────────────────────┤
│                      │                      │
│                      │                      │
│       Web View       │       Web View       │
│                      │                      │
│                      │                      │
├──────────────────────┴──────────────────────┤
│                  Web View                   │
│                                             │
└─────────────────────────────────────────────┘
```

The layout system will dynamically position multiple `WebContentsView` instances.

Potential capabilities include:

* Horizontal splits
* Vertical splits
* Nested layouts
* Resizable panes
* View focusing
* Keyboard-driven pane navigation

This feature will heavily influence the browser's internal view-management architecture.

---

## 5.2 Dotfile Configuration

Z Browser will experiment with a local configuration system inspired by applications such as Neovim.

A configuration file named:

```text
zbrowser.json
```

will eventually allow users to customize aspects of the browser such as:

* Keybindings
* Themes
* Command aliases
* User preferences
* Power-user behavior

Example:

```json
{
  "theme": "retro",
  "keybindings": {
    "newTab": "ctrl+t",
    "closeTab": "ctrl+w"
  },
  "aliases": {
    "g": ":open google.com"
  }
}
```

The exact schema will evolve as the feature is implemented.

The important architectural goal is to make Z Browser **configurable through files**, rather than forcing every customization through a graphical settings interface.

---

## 5.3 CLI Macro Runner

A further experiment is a local **CLI Macro Runner**.

This system will allow users to execute controlled TypeScript or JavaScript automation through commands entered into the Z Browser command interface.

Conceptually:

```text
Command Bar
     │
     ▼
Macro / Command Parser
     │
     ▼
Macro Runner
     │
     ▼
Browser APIs
     │
     ├── Tabs
     ├── Navigation
     ├── Layout
     └── Browser State
```

For example, a user could eventually create a script that performs a sequence of browser operations rather than manually repeating them.

Because this feature introduces significant security considerations, its design will prioritize:

* Explicit execution boundaries
* Controlled APIs
* Separation between website content and local automation
* Safe handling of user scripts
* Clear permission boundaries

The macro system should never be treated as equivalent to granting arbitrary web pages access to the local machine.

---

# 6. Architectural Direction

Z Browser's architecture will evolve around a central principle:

> **Separate the browser shell from the web content.**

The application will maintain ownership of:

* Browser state
* Tabs
* Layout
* Navigation commands
* User configuration
* Browser UI
* Power-user features

Chromium will provide the underlying web platform through Electron.

Conceptually:

```text
                         Z BROWSER
                              │
              ┌───────────────┴────────────────┐
              │                                │
        Browser Shell                    Browser State
              │                                │
      ┌───────┼────────┐              ┌────────┼────────┐
      │       │        │              │        │        │
     UI    Commands   Tabs          History  Config   Layout
      │       │        │
      └───────┴────────┘
              │
             IPC
              │
       WebContentsView
              │
          Chromium
              │
       ┌──────┼──────┐
       │      │      │
      HTML   CSS     JS
       │      │      │
       └──────┴──────┘
           Web Page
```

The architecture should remain modular enough that experimental features can be introduced without destabilizing the core browsing system.

---

# 7. Development Philosophy

Z Browser is being built with a **learn-by-building** approach.

Every major subsystem should answer four questions:

### What?

What does this system do?

### Why?

Why does the browser need it?

### How?

How does the implementation work?

### What did we learn?

What architectural and engineering concepts did building it teach us?

Documentation will therefore be developed alongside the implementation.

The project is intended to leave behind two artifacts:

1. **A functioning browser**
2. **A complete technical record explaining how and why it was built**

---

# 8. Project Scope

## Core Scope

The initial scope includes:

* Desktop browser shell
* Chromium-based web rendering
* Electron application architecture
* TypeScript application logic
* Multi-tab browsing
* Navigation
* Omnibox
* Secure context isolation
* Preload-based application bridges
* Controlled IPC
* Retro browser UI
* Linux / CLI mode

## Phase 2 Scope

The planned advanced scope includes:

* i3-style tiling
* Dynamic `WebContentsView` layouts
* `zbrowser.json` configuration
* Custom keybindings
* Command aliases
* CLI macros
* TypeScript/JavaScript automation

## Explicit Principle

Not every possible browser feature will automatically become part of Z Browser.

Features should be evaluated based on whether they:

* Improve the browsing experience
* Teach an important engineering concept
* Strengthen the project's identity
* Provide meaningful power-user functionality
* Fit the architecture

The project should prioritize **depth over feature count**.

---

# 9. Long-Term Vision

The long-term goal of Z Browser is to become a browser that feels fundamentally different from mainstream browsers while still providing the capabilities users expect from a modern web browser.

The vision can be summarized as:

```text
        Classic Desktop Computing
                    +
             Modern Chromium
                    +
             Linux Philosophy
                    +
          Power-User Automation
                    =
                Z BROWSER
```

It should feel like a piece of software from another era that somehow learned how to browse the modern web.

The browser shell should be nostalgic.

The underlying engine should be modern.

The interaction model should be powerful.

And the architecture should remain understandable enough that every major part can be explained by the people who built it.

---

# 10. Current Status

Z Browser is currently in the **early architecture and foundation stage**.

The initial Electron application shell has been established, including:

* Electron application startup
* TypeScript compilation
* Desktop window creation
* Initial browser toolbar
* Address/search input
* Initial Electron security configuration

The next stage is to establish the browser's actual web-rendering and navigation architecture using `WebContentsView`, followed by the core browser systems.

This document represents the **intended product and architectural direction** of Z Browser. Individual implementation details may evolve as development reveals better approaches, but significant architectural changes should be documented and justified rather than introduced implicitly.

---

## Summary

Z Browser is not an attempt to recreate Chromium.

It is an attempt to build a **different kind of browser experience on top of Chromium**.

Its foundation is:

* **Electron** for the desktop application
* **Chromium** for modern web rendering
* **TypeScript** for application logic
* **WebContentsView** for managed web content
* **IPC and secure contexts** for communication and isolation
* **Retro UI** for its visual identity
* **Linux Mode** for its interaction model
* **Tiling, configuration, and automation** for its power-user future

The central idea is simple:

> **Use an existing world-class browser engine, then build a browser experience that feels like our own.**
