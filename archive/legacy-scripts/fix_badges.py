import re

with open("frontend/app/globals.css", "r", encoding="utf-8") as f:
    css = f.read()

# Replace the entire Status Badges section
badges_pattern = re.compile(r'/\* Status Badges \*/.*?/\* Cards \*/', re.DOTALL)

new_badges = """/* Premium Status Badges */
  .mello-badge-pass, .mello-badge-fail, .mello-badge-review, .mello-badge-na, .mello-badge-not-verified {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-inter), monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
  }
  .mello-badge-pass::before, .mello-badge-fail::before, .mello-badge-review::before, .mello-badge-na::before, .mello-badge-not-verified::before {
    content: "";
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .mello-badge-pass {
    color: var(--color-pass);
    background-color: color-mix(in srgb, var(--color-pass) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-pass) 20%, transparent);
  }
  .mello-badge-pass::before { background-color: var(--color-pass); box-shadow: 0 0 8px var(--color-pass); }

  .mello-badge-fail {
    color: var(--color-noncompliant);
    background-color: color-mix(in srgb, var(--color-noncompliant) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-noncompliant) 20%, transparent);
  }
  .mello-badge-fail::before { background-color: var(--color-noncompliant); box-shadow: 0 0 8px var(--color-noncompliant); }

  .mello-badge-review {
    color: var(--color-review);
    background-color: color-mix(in srgb, var(--color-review) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-review) 20%, transparent);
  }
  .mello-badge-review::before { background-color: var(--color-review); box-shadow: 0 0 8px var(--color-review); }

  .mello-badge-na {
    color: var(--color-not-applicable);
    background-color: color-mix(in srgb, var(--color-not-applicable) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-not-applicable) 20%, transparent);
  }
  .mello-badge-na::before { background-color: var(--color-not-applicable); box-shadow: 0 0 8px var(--color-not-applicable); }

  .mello-badge-not-verified {
    color: var(--color-not-verified);
    background-color: color-mix(in srgb, var(--color-not-verified) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-not-verified) 20%, transparent);
  }
  .mello-badge-not-verified::before { background-color: var(--color-not-verified); box-shadow: 0 0 8px var(--color-not-verified); }

  /* Cards */"""

css = badges_pattern.sub(new_badges, css)

with open("frontend/app/globals.css", "w", encoding="utf-8") as f:
    f.write(css)
print("Badges upgraded")
