import React from 'react';

class PostWillRenderEmbed extends React.Component {
    render() {
        let maxHeight = 350;
        try {
            if (PostWillRenderEmbed.plugin.props.maxHeight != null) {
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
    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.mp4url;
        PostWillRenderEmbed.plugin = plugin;
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
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('mp4url', new Mp4UrlPlugin());