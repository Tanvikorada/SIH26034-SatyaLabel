with open("frontend/app/settings/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

# Make sure lucide icons are imported
page = page.replace("LogOut, Moon, Sun, Monitor", "LogOut, Moon, Sun, Monitor, Bell, Shield, Info, Smartphone")

# Add new sections
new_sections = """
          <section className="p-6 rounded-2xl bg-surface border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-medium mb-1">Preferences</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Manage your app experience.</p>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"><Bell size={18} /></div>
                <div>
                  <div className="font-medium text-[15px]">Push Notifications</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Receive alerts for new rules</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)] border border-[var(--color-border)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"><Shield size={18} /></div>
                <div>
                  <div className="font-medium text-[15px]">Data & Privacy</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Manage telemetry and logs</div>
                </div>
              </div>
              <button className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">Manage</button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"><Info size={18} /></div>
                <div>
                  <div className="font-medium text-[15px]">About SatyaLabel</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Version 2.0.4 (Enterprise Build)</div>
                </div>
              </div>
              <button className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">View Details</button>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium mb-1">Account</h2>
              <p className="text-sm text-text-secondary">Manage your session.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </section>
"""

page = page.replace("""<section className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium mb-1">Account</h2>
              <p className="text-sm text-text-secondary">Manage your session.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </section>""", new_sections)

# Add Made with Love by Tanvi to bottom
footer = """
        </div>
        
        <div className="mt-12 text-center text-[13px] text-[var(--color-text-muted)] flex flex-col items-center gap-2">
          <p>Smart India Hackathon 2026</p>
          <p className="font-medium">Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by Tanvi</p>
        </div>
      </main>
"""
page = page.replace("        </div>\n      </main>", footer)

with open("frontend/app/settings/page.jsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Settings upgraded")
