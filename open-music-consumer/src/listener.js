class Listener {
  constructor(playlistsService, playlistSongService, mailService) {
    this._playlistsService = playlistsService;
    this._playlistSongService = playlistSongService;
    this._mailService = mailService;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { targetEmail, playlistId } = JSON.parse(message.content.toString());
      const playlistData = await this._playlistsService.getPlaylistById(playlistId);
      const songs = await this._playlistSongService.getSongsByPlaylistId(playlistId);
      const responseData = JSON.stringify({
        playlist: {
          ...playlistData,
          songs,
        },
      });
      console.log('content');
      // console.log(content);
      console.log(songs);
      const result = await this._mailService.sendEmail(targetEmail, responseData);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Listener;
