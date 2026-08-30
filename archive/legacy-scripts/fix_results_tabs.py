import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Add activeTab state
if "const [activeTab, setActiveTab]" not in page:
    page = page.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const [activeTab, setActiveTab] = useState('action');")

# Replace the two sections with Tabs
old_rules_ui = r'<div className="mello-card-flat p-6">\s*<div className="flex items-center justify-between mb-6">\s*<h2 className="text-\[16px\] font-medium tracking-tight">Compliance Ledger</h2>\s*</div>\s*<div className="space-y-6">\s*<div>\s*<h3 className="text-\[13px\].*?</div>\s*</div>'

new_rules_ui = """<div className="mello-card-flat p-0 overflow-hidden flex flex-col h-full">
            <div className="p-6 pb-0">
              <h2 className="text-[16px] font-medium tracking-tight mb-4">Compliance Ledger</h2>
              
              {/* TABS */}
              <div className="flex gap-4 border-b border-border">
                <button 
                  onClick={() => setActiveTab('action')}
                  className={`pb-3 text-[13px] font-medium transition-colors border-b-2 ${activeTab === 'action' ? 'border-[#f87171] text-[#f87171]' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                >
                  <span className="w-1.5 h-1.5 inline-block rounded-full bg-[#f87171] mr-2"></span>
                  Action Required ({actionRequired.length})
                </button>
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`pb-3 text-[13px] font-medium transition-colors border-b-2 ${activeTab === 'all' ? 'border-blue-500 text-blue-500' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                >
                  <span className="w-1.5 h-1.5 inline-block rounded-full bg-blue-500 mr-2"></span>
                  Full 2011 Checklist ({allRules.length})
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px] flex-1 space-y-4">
              {activeTab === 'action' && (
                <>
                  {actionRequired.length > 0 ? (
                    actionRequired.map(renderRule)
                  ) : (
                    <div className="text-center py-8 text-text-secondary text-[13px]">No violations found. Product is fully compliant.</div>
                  )}
                </>
              )}

              {activeTab === 'all' && (
                <>
                  {allRules.map(renderRule)}
                </>
              )}
            </div>
          </div>"""

page = re.sub(old_rules_ui, new_rules_ui, page, flags=re.DOTALL)

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated results UI to use Tabs")
