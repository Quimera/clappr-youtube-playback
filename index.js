import {Playback, Mediator, Events} from 'clappr'
import YoutubeHTML from './youtube.html'
import template from './template.js'
import style from './style.css'

export default class YoutubePlayback extends Playback {
  get name() { return 'youtube_playback' }

  get template_gen() { 
    return template(YoutubeHTML) 
  }

  get attributes() {
    return {
      'data-youtube-playback': '',
      class: 'clappr-youtube-playback',
      id: this.cid
    }
  }

  constructor(options) {
    super(options)
    this.options = options
    this.settings = {
      seekEnabled: true,
      left: ['playpause', 'position', 'duration'],
      default: ['seekbar'],
      right:['fullscreen','volume', 'hd-indicator']
    }
    Mediator.on(Events.PLAYER_RESIZE, this.updateSize, this)
  }

  setupYoutubePlayer() {
    if (window.YT && window.YT.Player) {
      this.embedYoutubePlayer()
    } else {
      this.embedYoutubeApiScript()
    }
  }

  alreadyYoutubeApiScript() {
    var scripts = document.getElementsByTagName('script')
    var result = false
    for (var i in scripts) {
      if (scripts[i].src == 'https://www.youtube.com/iframe_api') {
        result = true
      }
    }
    return result
  }

  embedYoutubeApiScript() {
      if (!this.alreadyYoutubeApiScript()) {
        var script = document.createElement('script')
        script.setAttribute('type', 'text/javascript')
        script.setAttribute('async', 'async')
        script.setAttribute('src', 'https://www.youtube.com/iframe_api')
        document.body.appendChild(script)
        window.players = []
      }
      window.players.push(this)
      window.onYouTubeIframeAPIReady = () => this.AsyncExec()
  }

  AsyncExec() {
    for (var i in window.players) {
      window.players[i].embedYoutubePlayer()
    }
  }

  embedYoutubePlayer() {
    var playerVars = {
      controls: 0,
      autoplay: 0,
      disablekb: 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      showinfo: 0,
      html5: 1
    }
    var video = isYoutubeSrc(this.options.src)
    if (video.type == 'playlist') {
      playerVars.listType = 'playlist'
      playerVars.list = video.id
    }

    this.player = new YT.Player(`yt${this.cid}`, {
      videoId: video.id,
      playerVars: playerVars,
      events: {
        onReady: () => this.ready(),
        onStateChange: (event) => this.stateChange(event),
        onPlaybackQualityChange: (event) => this.qualityChange(event)
      }
    })
  }

  updateSize() {
    this.player && this.player.setSize(this.$el.width(), this.$el.height())
  }

  ready() {
    this._ready = true
    this.trigger(Events.PLAYBACK_READY)
  }

  qualityChange(event) {
    this.trigger(Events.PLAYBACK_HIGHDEFINITIONUPDATE)
  }

  stateChange(event) {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        this.enableMediaControl()
        this.trigger(Events.PLAYBACK_PLAY)
        break
      case YT.PlayerState.ENDED:
        if (this.options.youtubeShowRelated) {
          this.disableMediaControl()
        } else {
          this.trigger(Events.PLAYBACK_ENDED)
        }
        break
      default: break
    }
  }

  play() {
    if (this._ready) {
      this._progressTimer = this._progressTimer || setInterval(() => this.progress(), 100)
      this._timeupdateTimer = setInterval(() => this.timeupdate(), 100)
      this.player.playVideo()
      this.trigger(Events.PLAYBACK_PLAY)
      this.trigger(Events.PLAYBACK_BUFFERFULL)
    } else {
      this.listenToOnce(this, Events.PLAYBACK_READY, this.play)
    }
  }

  pause() {
    clearInterval(this._timeupdateTimer)
    this._timeupdateTimer = null
    this.player && this.player.pauseVideo()
  }

  seek(position) {
    if (!this.player) return
    var duration = this.player.getDuration()
    var time = position * duration / 100
    this.player.seekTo(time)
  }

  volume(value) {
    this.player && this.player.setVolume(value)
  }

  progress() {
    var buffered = this.player.getDuration() * this.player.getVideoLoadedFraction()
    this.trigger(Events.PLAYBACK_PROGRESS, 0, buffered, this.player.getDuration())
  }

  timeupdate() {
    this.trigger(Events.PLAYBACK_TIMEUPDATE, this.player.getCurrentTime(), this.player.getDuration())
  }

  isPlaying() {
    return this.player && this._timeupdateTimer && this.player.getPlayerState() == YT.PlayerState.PLAYING
  }

  isHighDefinitionInUse() {
    return this.player && !!this.player.getPlaybackQuality().match(/^hd\d+/)
  }

  getDuration() {
    var duration = 0
    if (this.player) {
      duration = this.player.getDuration()
    }
    return duration
  }

  disableMediaControl() {
    this.$el.css({'pointer-events': 'auto'})
    this.trigger(Events.PLAYBACK_MEDIACONTROL_DISABLE)
  }

  enableMediaControl() {
    this.$el.css({'pointer-events': 'none'})
    this.trigger(Events.PLAYBACK_MEDIACONTROL_ENABLE)
  }

  render() {
    var templateOptions = {id: 'yt'+this.cid}
    this.$el.html(this.template_gen(templateOptions))
    var style = $('<style>').html(style)
    this.$el.append(style)
    this.setupYoutubePlayer()
    return this;
  }
}

YoutubePlayback.canPlay = function(source) {
  var result = isYoutubeSrc(source)
  if (result.id !== null) {
    return true
  } else {
    return false
  }
};

var isYoutubeSrc = function(source) {

  var result = {
    'type': 'video',
    'id': null
  }
  var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = source.match(regex);

  if (match && match[2].length === 11) {
    result.id = match[2];
  }

  var regPlaylist = /[?&]list=([^#\&\?]+)/;
  match = source.match(regPlaylist);

  if(match && match[1]) {
    result.id = match[1];
    result.type = 'playlist'
  }

  return result;
}


module.exports = window.YoutubePlayback = YoutubePlayback;
