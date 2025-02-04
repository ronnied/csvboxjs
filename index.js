class CSVBoxImporter {
            
    constructor(slug, data = {}, callback = null) {
        
        this.isIframeLoaded = false;
        this.shouldOpenModalonIframeLoad = false;
        this.slug = slug;
        this.data = data;
        this.columns = [];
        this.options = [];

        if (callback && (typeof callback == "function")) {
            this.callback = callback;
        }
        let self= this;
        if(document.readyState === "complete") {
            self.setUpImporter();
        }
        document.addEventListener('DOMContentLoaded', function() {
            self.setUpImporter();
        });
    }

    setUpImporter() {

        this.isModalShown = false;

        document.addEventListener('DOMContentLoaded', function() {
            setUpImporter();
        });

        this.setupMessageListener();

        let cssText = "" +
            ".csvbox-component {" +
                "position: fixed;" +
                "top: 0;" +
                "bottom: 0;" +
                "left: 0;" +
                "right: 0;" +
                "z-index:2147483647;" +
            "}" +
            ".csvbox-component iframe{" +
                "height: 100%;" +
                "width: 100%;" +
                "position: absolute;" +
                "top: 0px;" +
                "left: 0px;" +
            "}";

        let css = document.createElement("style");
        css.type = "text/css";
        if ("textContent" in css)
            css.textContent = cssText;
        else
            css.innerText = cssText;
        document.body.appendChild(css);

        this.id = "csvbox-embed-" + this.randomString();
        this.holder = document.createElement("div");
        this.holder.classList.add('csvbox-component');
        this.holder.style.display = "none";

        let iframe = document.createElement("iframe");
        this.iframe = iframe;
        
        iframe.setAttribute("src", "https://app.csvbox.io/embed/" + this.slug);
        iframe.frameBorder = 0;
        this.holder.id = this.id;
        this.holder.appendChild(iframe);
        document.body.appendChild(this.holder);

        let self = this;

        iframe.onload = function () {
            self.isIframeLoaded = true;
            if(self.shouldOpenModalonIframeLoad) {
                self.shouldOpenModalonIframeLoad = false;
                self.openModal();
            }
            iframe.contentWindow.postMessage({
                "customer" : self.data
            }, "*");
            iframe.contentWindow.postMessage({
                "columns" : self.columns
            }, "*");
            iframe.contentWindow.postMessage({
                "options" : self.options
            }, "*");
        }

        if(document.querySelector("[data-csvbox]") != null){
            document.onreadystatechange = () => {
                if (document.readyState === 'complete') {
                    document.querySelector("[data-csvbox]").disabled = false;
                }else{
                    document.querySelector("[data-csvbox]").disabled = true;
                }
            };
        }
        
    }

    setUser(data) {
        this.data = data;
        if(this.iframe) {
            this.iframe.contentWindow.postMessage({
                "customer" : this.data
            }, "*");
        }
    }

    setupMessageListener() {
        window.addEventListener("message", (event) => {
            if (event.data === "mainModalHidden") {
                this.holder.style.display = 'none';
                this.isModalShown = false;
            }
            if(event.data === "uploadSuccessful") {
                if(this.callback && (typeof this.callback == "function")){
                    this.callback(true);
                }
            }
            if(event.data === "uploadFailed") {
                if(this.callback && (typeof this.callback == "function")){
                    this.callback(false);
                }
            }
            if(typeof event.data == "object") {
                if(event.data.type && event.data.type == "data-push-status") {
                    if(event.data.data.import_status == "success"){
                        event.data.data.rows = event.data.row_data;
                        this.callback(true, event.data.data);
                    }else {
                        this.callback(false, event.data.data);
                    }

                }
            }
        }, false);
    }

    openModal() {
        if(this.isIframeLoaded) {
            if(!this.isModalShown) {
                this.isModalShown = true;
                this.holder.querySelector('iframe').contentWindow.postMessage('openModal', '*');
                this.holder.style.display = 'block';
            }
        }else{
            this.shouldOpenModalonIframeLoad = true;
        }
    }

    randomString() {
        let result = '';
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 15; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    setDynamicColumns(columns) {
        this.columns = columns;
        if(this.iframe) {
            this.iframe.contentWindow.postMessage({
                "columns" : this.columns
            }, "*");
        }
    }

    setOptions(options) {
        this.options = options;
        if(this.iframe) {
            this.iframe.contentWindow.postMessage({
                "options" : this.options
            }, "*");
        }
    }

}

export default CSVBoxImporter;
