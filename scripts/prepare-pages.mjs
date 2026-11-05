import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'komorebi-pages-'));
const run=args=>execFileSync('git',args,{encoding:'utf8',env:{...process.env,GIT_INDEX_FILE:join(dir,'index')}}).trim();
function ref(name){try{return run(['rev-parse','--verify',name]);}catch(error){if(error.status===128)return null;throw error;}}
function ancestor(a,b){try{run(['merge-base','--is-ancestor',a,b]);return true;}catch(error){if(error.status===1)return false;throw error;}}
try {
 const local=ref('refs/heads/komorebi-site'),remote=ref('refs/remotes/origin/komorebi-site');
 let parent=remote||local;
 if(local&&remote){if(ancestor(local,remote))parent=remote;else if(ancestor(remote,local))parent=local;else throw new Error('Deployment branches have diverged. Resolve them before publishing.');}
 run(parent?['read-tree',parent]:['read-tree','--empty']);
 const html=readFileSync('dist/KOMOREBI.html','utf8').replace('href="./KOMOREBI.html"','href="./"');
 writeFileSync(join(dir,'index.html'),html);
 writeFileSync(join(dir,'nojekyll'),'');
 const files=[['index.html',join(dir,'index.html')],['.nojekyll',join(dir,'nojekyll')]];
 if(!parent){writeFileSync(join(dir,'README.md'),'# KOMOREBI\n\nA first-person life game with mouse drag and touch controls.\n\nGitHub Pages: deploy the `komorebi-site` branch, `/ (root)`.\n\nThe hotel interior is provisional and has not been matched to the real property.\n');files.push(['README.md',join(dir,'README.md')]);}
 for(const[target,source]of files){const hash=run(['hash-object','-w','--',source]);run(['update-index','--add','--cacheinfo',`100644,${hash},${target}`]);}
 const tree=run(['write-tree']);
 if(parent&&tree===run(['rev-parse',`${parent}^{tree}`])){console.log(`Deployment already contains this game: ${parent}`);}
 else{const args=['-c','user.name=Codex','-c','user.email=codex@localhost','commit-tree',tree];if(parent)args.push('-p',parent);args.push('-m',process.argv[2]||'Update KOMOREBI game');const commit=run(args);run(['update-ref','refs/heads/komorebi-site',commit,local||'0000000000000000000000000000000000000000']);console.log(`Prepared komorebi-site at ${commit}; working checkout and index unchanged.`);}
} finally {rmSync(dir,{recursive:true,force:true});}
