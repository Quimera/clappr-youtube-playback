# clappr-youtube-playback
Clappr plugin for playing YouTube based videos

It uses the [YouTube iframe API](https://developers.google.com/youtube/iframe_api_reference) for managing the YouTube content.

Install dependencies:

`npm install`

Build:

`npm run build`

Minified version:

`npm run release`

### Usage

Just embed the player enabling the plugin, setting source to YouTube video id:
```javascript
var player = new Clappr.Player({
  sources: ['https://www.youtube.com/watch?v=nfWlot6h_JM'],
  poster: 'https://i.ytimg.com/vi/nfWlot6h_JM/hqdefault.jpg',
  parentId: '#player-wrapper',
  plugins: {
    playback: [YoutubePlayback]
  }
});
```
You can try it [here](http://towerz.github.io/clappr-youtube-playback/).

### Playlist support

Although using an array of video ids to create a dynamic playlist is still not supported, the plugin has support for YouTube lists. Just omit the parameter `source` or `sources` and add `youtubePlaylist` instead, like the example:
```javascript
var player = new Clappr.Player({
  poster: 'https://i.ytimg.com/vi/nfWlot6h_JM/hqdefault.jpg',
  parentId: '#player-wrapper',
  youtubeShowRelated: true,
  youtubePlaylist: 'PUANLZYMidaCbLQFWXBC95Jg',
  plugins: {
    playback: [YoutubePlayback]
  }
});
```
