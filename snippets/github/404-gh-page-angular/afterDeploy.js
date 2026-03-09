const cfg = { 
  // path to angular dist; ex "./root_project/dist"
  folderPathToAngularIndex: "dist", 
  
  // regex to find index.html in folder $folderPathToAngularIndex
  regexIndex: "index.*\\.html",        

  // nodejs file option
  fileOption: { encoding: "utf-8" },   
}

// ---------------------------------------------------------------------

const dist = join(process.cwd(), cfg.folderPathToAngularIndex);
const rgx = new RegExp(cfg.regexIndex);
const arr = readdirSync(dist).filter(v => rgx.test(v));

if (arr.length === 1) {
  try {
    // read and parse index
    const contentHTML = readFileSync(join(dist, arr[0]), cfg.fileOption)
      .replace(/data-page-type=".*"/, 'data-page-type="404"');
    
    // write file to dist
    writeFileSync(join(dist, "404.html"), contentHTML, cfg.fileOption);
    
    console.log("successfully 404.html generated"); 
  } catch (err) {
    throw err
  }
} else {
  console.error(`${arr.length} index found. not supported by the script.`, { dist, arr });
  process.exit(1);
}
