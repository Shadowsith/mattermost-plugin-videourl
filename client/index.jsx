import React from 'react';
import axios from 'axios';

class PluginSettings {
    constructor(data) {
        /**
         * @type {number}
         */
        this.maxHeight = data.maxHeight;
        /**
         * @type {boolean}
         */
        this.mp4 = data.mp4 == null ? true : data.mp4;
        /**
         * @type {boolean}
         */
        this.webm = data.webm == null ? true : data.webm;
        /**
         * @type {boolean}
         */
        this.mov = data.mov == null ? true : data.mov;
        /**
         * @type {boolean}
         */
        this.avi = data.avi == null ? true : data.avi;
        /**
         * @type {boolean}
         */
        this.wmv = data.wmv == null ? true : data.wmv;
        /**
         * @type {boolean}
         */
        this.ogv = data.ogv == null ? true : data.ogv;
        /**
         * @type {string[]}
         */
        this.blacklist = null;
        try {
            this.blacklist = data.blacklist
                .replaceAll(' ', '').split(',');
        } catch {
        }
    }
}

class PostWillRenderEmbed extends React.Component {
    static plugin;
    /**
     * @type {PluginSettings}
     */
    static settings;

    render() {
        let maxHeight = 350;
        try {
            if (PostWillRenderEmbed.settings != null) {
                maxHeight = PostWillRenderEmbed.settings.maxHeight;
            } else if (PostWillRenderEmbed.plugin.props.maxHeight != null) {
                maxHeight = PostWillRenderEmbed.plugin.props.maxHeight;
            }
        } catch {
        }
        const css = `
            .videourl-mh {
                max-height: ${maxHeight}px;
            }`

        const fileType = this.getVideoUrlType(this.props.embed.url);

        return (
            <div>
                <style>{css}</style>
                <video controls="true" class="videourl-mh">
                    <source src={this.props.embed.url} type={fileType} />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    /**
     * 
     * @param {string} url 
     * @returns string
     */
    getVideoUrlType(url) {
        try {
            const split = url.split('.');
            switch (split[split.length - 1]) {
                case 'webm':
                    return 'video/mp4';

                case 'mov':
                    return 'video/quicktime';

                case 'avi':
                    return 'video/x-msvideo';

                case 'wmv':
                    return 'video/x-ms-wmv';

                case 'ogv':
                    return 'video/ogv';

                case 'mp4':
                default:
                    return 'video/mp4';
            }
        } catch {
            return 'video/mp4';
        }
    }
}

class VideoUrlPlugin {
    static apiUrl = '/plugins/videourl';

    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.videourl;
        PostWillRenderEmbed.plugin = plugin;
        axios.get(`${VideoUrlPlugin.apiUrl}/settings`)
            .then(res => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings(res.data);
                PostWillRenderEmbed.settings = settings;
                registry.registerPostWillRenderEmbedComponent(
                    (embed) => {
                        try {
                            const url = embed.url;
                            const isFileSupported = (
                                (url.includes('.mp4') && settings.mp4)
                                || (url.includes('.webm') && settings.webm)
                                || (url.includes('.mov') && settings.mov)
                                || (url.includes('.avi') && settings.avi)
                                || (url.includes('.wmv') && settings.wmv)
                                || (url.includes('.ogv') && settings.ogv)
                            );
                            if (embed.type == 'link' && isFileSupported) {
                                if (settings.blacklist != null) {
                                    const blacklisted = settings.blacklist.find(x => {
                                        return url.includes(x);
                                    });
                                    if (blacklisted != null) {
                                        return false;
                                    }
                                }
                                return true;
                            }
                            return false;
                        } catch {
                            return false;
                        }
                    },
                    PostWillRenderEmbed,
                    false,
                );
            })
            .catch(err => {
                console.log('VideoUrl Settings Err', err);
                registry.registerPostWillRenderEmbedComponent(
                    (embed) => {
                        try {
                            if (embed.type == 'link'
                                && embed.url.includes('.mp4')
                                && embed.url.includes('.webm')
                                && embed.url.includes('.mov')
                                && embed.url.includes('.avi')
                                && embed.url.includes('.wmv')
                                && embed.url.includes('.ogv')
                            ) {
                                return true;
                            }
                            return false;
                        } catch {
                            return false;
                        }
                    },
                    PostWillRenderEmbed,
                    false,
                );
            });
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('videourl', new VideoUrlPlugin());