import React from 'react';
import axios from 'axios';

class PluginSettings {
    constructor(data) {
        /**
         * @type {number}
         */
        this.maxHeight = data.maxHeight;
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
            .mp4url-mh {
                max-height: ${maxHeight}px;
            }`

        return (
            <div>
                <style>{css}</style>
                <video controls="true" class="mp4url-mh">
                    <source src={this.props.embed.url} type="video/mp4" />
                </video>
            </div>
        );
    }
}

class Mp4UrlPlugin {
    static apiUrl = '/plugins/mp4url';

    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.mp4url;
        PostWillRenderEmbed.plugin = plugin;
        axios.get(`${Mp4UrlPlugin.apiUrl}/settings`)
            .then(res => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings(res.data);
                PostWillRenderEmbed.settings = settings;
                registry.registerPostWillRenderEmbedComponent(
                    (embed) => {
                        const url = embed.url;
                        if (embed.type == 'link' && url.includes('.mp4')) {
                            if (settings.blacklist != null) {
                                console.log('Blacklist', settings, url);
                                const blacklisted = settings.blacklist.find(x => {
                                    return url.includes(x);
                                });
                                if (blacklisted != null) {
                                    console.log('Blacklist here');
                                    return false;
                                }
                            }
                            return true;
                        }
                        return false;
                    },
                    PostWillRenderEmbed,
                    false,
                );
            })
            .catch(err => {
                console.log('Mp4Url Settings Err', err);
                registry.registerPostWillRenderEmbedComponent(
                    (embed) => {
                        if (embed.type == 'link' && embed.url.includes('.mp4')) {
                            return true;
                        }
                        return false;
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

window.registerPlugin('mp4url', new Mp4UrlPlugin());