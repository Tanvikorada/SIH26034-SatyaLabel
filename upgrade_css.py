with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_css = """
/*  Premium Landing Page Enhancements  */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}

.text-gradient-animated {
  background: linear-gradient(270deg, #FF9933, #138808, #00BFFF, #FF9933);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 8s ease infinite;
}
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Mouse-tracking spotlight for bento box */
.bento-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.bento-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
}
.bento-card::before {
  content: "";
  position: absolute;
  top: var(--y, 50%);
  left: var(--x, 50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle closest-side, rgba(255, 153, 51, 0.15), transparent);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}
.bento-card:hover::before {
  opacity: 1;
}
.bento-content {
  position: relative;
  z-index: 1;
}

/* Terminal Typing */
.terminal-window {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  font-family: monospace;
  overflow: hidden;
}
.terminal-header {
  background: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 6px;
}
.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.terminal-dot.red { background: #ff5f56; }
.terminal-dot.yellow { background: #ffbd2e; }
.terminal-dot.green { background: #27c93f; }

/* Grid floor */
.cyber-grid {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background-image: 
    linear-gradient(rgba(255,153,51, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,153,51, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: bottom;
  animation: grid-move 5s linear infinite;
  mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
  pointer-events: none;
}
@keyframes grid-move {
  0% { background-position: 0 0; }
  100% { background-position: 0 50px; }
}

@layer utilities {
"""

css = css.replace('@layer utilities {', new_css)

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("CSS injected")
