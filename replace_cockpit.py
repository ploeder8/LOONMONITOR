with open("src/pages/HomePage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if line.strip().startswith("function ProfileForm("):
        start_idx = i
    if line.strip() == "// ─── InputCockpit ────────────────────────────────────────────────────────────":
        end_idx = i
        break

print(f"ProfileForm start: {start_idx}, InputCockpit start: {end_idx}")
if start_idx is None or end_idx is None:
    print("ERROR: Could not find markers")
    exit(1)

with open("src/pages/HomePage_cockpit.tsx", "r", encoding="utf-8") as f:
    cockpit_lines = f.readlines()

# Ensure cockpit code ends with newline
if cockpit_lines and not cockpit_lines[-1].endswith("\n"):
    cockpit_lines[-1] += "\n"

new_lines = lines[:start_idx] + ["\n"] + cockpit_lines + ["\n"] + lines[end_idx:]

with open("src/pages/HomePage.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Success!")
