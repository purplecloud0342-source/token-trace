import fs from 'fs';

const filePath = './src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `                    <div className="flex-1 space-y-12 relative z-10">
                      <p className="text-2xl text-forest/70 leading-relaxed font-bold tracking-tight">
                        {t('section_human.bias_desc')}
                      </p>
                      
                      <div className="space-y-8">
                        <button 
                          onClick={() => toggleSubsection('4.3')}
                          className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest group/btn"
                        >
                          <span className="border-b-2 border-blue-600/20 group-hover/btn:border-blue-600 transition-colors pb-1">
                            {expandedSubsections['4.3'] ? 'Conceal Cycles' : 'Algorithmic Stereotypes: In-Depth'}
                          </span>
                          <ChevronDown size={14} className={\`transition-transform duration-500 \${expandedSubsections['4.3'] ? 'rotate-180' : ''}\`} />
                        </button>
                      </div>
                    </div>`;

const replacement = `              <div className="flex justify-center">
                <button 
                  onClick={() => toggleSubsection('4.3')}
                  className="group flex items-center gap-4 px-10 py-5 bg-white border-2 border-forest text-forest rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-forest hover:text-white transition-all duration-500 shadow-xl"
                >
                  <span>{expandedSubsections['4.3'] ? 'Hide Details' : 'Analyze Bias Cycle'}</span>
                  <div className={\`p-1 bg-clay rounded-full text-white transition-transform duration-700 \${expandedSubsections['4.3'] ? 'rotate-180' : ''}\`}>
                    <ChevronDown size={14} />
                  </div>
                </button>
              </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully replaced 4.3 content');
} else {
    console.error('Target not found');
    // Try a more relaxed match
    console.log('Content slice around target area:', content.substring(content.indexOf('Bias Card'), content.indexOf('RefreshCw') + 500));
}
