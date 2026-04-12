(async () => {
    const app = document.getElementById("panel-giscus");

    async function loadDiscussion(id) {
        const res = await fetch(`data/discussions/${id}.json`);
        if (!res.ok) throw new Error(`Discussion #${id} 404`);
        return res.json();
    }

    function loadGiscus(id) {
        const section = document.getElementById('comments');
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'tmslpm/tmslpm');
        script.setAttribute('data-repo-id', 'R_kgDOR0RVUQ');
        script.setAttribute('data-mapping', 'number');
        script.setAttribute('data-term', String(id));
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', 'dark_dimmed');
        script.setAttribute('data-lang', 'en');
        script.setAttribute('data-loading', 'lazy');
        script.crossOrigin = 'anonymous';
        script.async = true;
        section.appendChild(script);
        section.hidden = false;
    }
})();
