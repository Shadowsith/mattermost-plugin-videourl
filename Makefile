all:
	make prepare
	make linux
	make macos
	make windows
	make webapp
	make pack

prepare:
	rm -f mattermost-mp4url-plugin.tar.gz
	rm -rf mattermost-mp4url-plugin
	mkdir -p mattermost-mp4url-plugin
	mkdir -p mattermost-mp4url-plugin/client
	mkdir -p mattermost-mp4url-plugin/server

linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o mattermost-mp4url-plugin/server/plugin-linux-amd64 server/plugin.go

macos:
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o mattermost-mp4url-plugin/server/plugin-darwin-amd64 server/plugin.go

windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o mattermost-mp4url-plugin/server/plugin-windows-amd64 server/plugin.go

webapp:
	mkdir -p dist
	npm install
	./node_modules/.bin/webpack --mode=production

pack:
	cp -r dist/main.js mattermost-mp4url-plugin/client
	cp plugin.json mattermost-mp4url-plugin/
	tar -czvf mattermost-mp4url-plugin.tar.gz mattermost-mp4url-plugin
