package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

// Mp4UrlPlugin implements the interface expected by the Mattermost server to communicate
// between the server and plugin processes.
type Mp4UrlPlugin struct {
	plugin.MattermostPlugin
}

type PluginSettings struct {
	MaxHeight int    `json:"maxHeight"`
	Blacklist string `json:"blacklist"`
}

const (
	routeSettings = "/settings"
)

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Mp4UrlPlugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	settings := p.getSettings(w)
	res := p.handleSettingsResult(settings)
	fmt.Fprint(w, res)
}

func (p *Mp4UrlPlugin) getSettings(w http.ResponseWriter) *PluginSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["mp4url"]
	settings := new(PluginSettings)
	if ok {
		for k, v := range pluginSettings {
			if k == "maxheight" {
				maxHeight, err := strconv.Atoi(
					fmt.Sprintf("%v", v))
				if err != nil {
					log.Fatal(err)
				}
				settings.MaxHeight = maxHeight
			} else if k == "blacklist" {
				settings.Blacklist = v.(string)
			}
		}
	}
	return settings
}

func (p *Mp4UrlPlugin) handleSettingsResult(settings *PluginSettings) string {
	json, err := json.Marshal(&settings)
	if err != nil {
		return "{}"
	} else {
		return string(json)
	}
}

// This example demonstrates a plugin that handles HTTP requests which respond by greeting the
// world.
func main() {
	plugin.ClientMain(&Mp4UrlPlugin{})
}
