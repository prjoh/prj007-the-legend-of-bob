import * as THREE from "./vendor/three/build/three.module.js";


export const LoadingManager = (() => {
    let loading_manager = null;
    let callback = null;

    function create() {
        loading_manager = new THREE.LoadingManager();
        loading_manager.onStart = (path, items_loaded, items_total) => {
            // console.log("Started loading file: " + path + ".\nLoaded " + items_loaded + " of " + items_total + " files.");
        };
        loading_manager.onProgress = (path, items_loaded, items_total) => {
            // console.log("Loading file: " + path.length + ".\nLoaded " + items_loaded + " of " + items_total + " files.");
        };
        loading_manager.onLoad = () => {
            console.log("Loading complete!");
            if (callback instanceof Function)
                callback();
        };
        loading_manager.onError = (path) => {
            console.log("There was an error loading " + path);
        };
    }

    return {
        init: function(_callback) {
            callback = _callback;
        },
        instance: function() {
            if (loading_manager == null)
                create();
            Object.freeze(loading_manager);
            return loading_manager;
        }
    };
})();
