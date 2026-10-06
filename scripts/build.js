import {cp,mkdir,rm,readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function filesAt(dir){const entries=await readdir(dir,{withFileTypes:true});const paths=[];for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){const path=dir+'/'+entry.name;if(entry.isDirectory())paths.push(...await filesAt(path));else paths.push(path);}return paths;}
const hash=createHash('sha256');for(const path of await filesAt('public')){hash.update(path);hash.update(await readFile(path));}
const version=hash.digest('hex').slice(0,16);
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
const worker=await readFile('dist/sw.js','utf8');await writeFile('dist/sw.js',worker.replace(/const CACHE='[^']+'/,`const CACHE='connect-four-${version}'`));
console.log('Static game built in dist/ — release '+version);
