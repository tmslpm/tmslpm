## 🚀 Generate 404 for GitHub Pages in Angular

The script: run this script after the build to duplicate the index.html and modify the attribute on the body

```js
const cfg = { 
  folderPathToAngularIndex: "dist", 
  regexIndex: "index.*\\.html", 
  fileOption: { encoding: "utf-8" } }
 
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
```

## 🛠️ Modify index.html

Add the `data-page-type` attribute to the `<body>` tag of your `index.html`.
  This will help differentiate between the main app and the 404 page.
  
```html 
<body data-page-type="main"> </body> 
```

> When the `404.html` is created by the script, this `data-page-type` 
> attribute will be set to `"404"`.
 
--------------------------------------------------------------

## 🧠 Use the Constant in Your Routing Logic
  
You'll need to grab the value of `data-page-type` from the body tag. 
If the page is a 404, it will be updated to reflect that in your app.

```ts  
const IS_GH_404 = document.body.getAttribute("data-page-type") === "404"; 
```

### Example 1: Simple Route Setup

```ts
const ROUTES: Route[] = [
 ...(IS_GH_404 ? [{ path: "**", redirectTo: "error" }] : []),
 { component: HomeComponent, path: "", pathMatch: "full"},
 { component: ErrorComponent, path: "error" },
 { component: ErrorComponent, path: "**" }
]
```

This setup dynamically adds a wildcard route to redirect any undefined 
paths to an error page if `IS_GH_404` is `true`.

--------------------------------------------------------------

### Example 2: Using a Guard 🛡️

```ts 
class Error404RedirectGuard implements CanActivate {  
  constructor(private router: Router) { }   
  canActivate(): boolean { 
    if (document.body.getAttribute("data-page-type") === "404") {
      this.router.navigate(["/error"]);
      return false;
    }
    return true;
  }  
}

const ROUTES: Route[] = [ 
 { component: HomeComponent, path: "", pathMatch: "full", canActivate: [Error404RedirectGuard] },
 { component: ErrorComponent, path: "error" },
 { component: ErrorComponent, path: "**" }
]
```

In this example, we create a **guard** to check if the page type is `404`, 
and if so, redirect the user to the error page before allowing the route.

## 🎉 You're all set!

Now your Angular app is fully configured to handle custom 404 pages on GitHub Pages!
