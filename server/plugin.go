package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

// VideoUrlPlugin implements the interface expected by the Mattermost server to communicate
// between the server and plugin processes.
type VideoUrlPlugin struct {
	plugin.MattermostPlugin
}

type PluginSettings struct {
	MaxHeight int    `json:"maxHeight"`
	Blacklist string `json:"blacklist"`
	Mp4       bool   `json:"mp4"`
	Webm      bool   `json:"webm"`
	Mov       bool   `json:"mov"`
	Avi       bool   `json:"avi"`
	Wmv       bool   `json:"wmv"`
	Ogv       bool   `json:"ogv"`
}

const (
	routeSettings = "/settings"
)

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *VideoUrlPlugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	settings := p.getSettings(w)
	res := p.handleSettingsResult(settings)
	fmt.Fprint(w, res)
}

func (p *VideoUrlPlugin) getSettings(w http.ResponseWriter) PluginSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["videourl"]
	settings := PluginSettings{
		MaxHeight: 350,
		Blacklist: "",
		Mp4:       true,
		Webm:      true,
		Mov:       true,
		Avi:       true,
		Wmv:       true,
		Ogv:       true,
	}
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
			} else if k == "mp4" {
				settings.Mp4 = p.getBoolVal(v)
			} else if k == "webm" {
				settings.Webm = p.getBoolVal(v)
			} else if k == "mov" {
				settings.Mov = p.getBoolVal(v)
			} else if k == "avi" {
				settings.Avi = p.getBoolVal(v)
			} else if k == "wmv" {
				settings.Wmv = p.getBoolVal(v)
			} else if k == "ogv" {
				settings.Ogv = p.getBoolVal(v)
			}
		}
	}
	return settings
}

func (p *VideoUrlPlugin) getBoolVal(v interface{}) bool {
	val, ok := v.(bool)
	if !ok {
		val = true
	}
	return val
}

func (p *VideoUrlPlugin) handleSettingsResult(settings PluginSettings) string {
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
	plugin.ClientMain(&VideoUrlPlugin{})
}
