./node_modules/.bin/webpack --mode=production
rm -f mattermost-mp4url-plugin.tar.gz
rm -rf mattermost-mp4url-plugin
mkdir -p mattermost-mp4url-plugin
cp -r dist/main.js mattermost-mp4url-plugin/
cp plugin.json mattermost-mp4url-plugin/
tar -czvf mattermost-mp4url-plugin.tar.gz mattermost-mp4url-plugin