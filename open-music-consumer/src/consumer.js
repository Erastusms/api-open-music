require('dotenv').config();
const amqp = require('amqplib');
const Listener = require('./listener');
const MailService = require('./MailService');
const PlaylistSongService = require('./PlaylistSongService');
const PlaylistsService = require('./PlaylistsService');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const playlistSongService = new PlaylistSongService();
  const mailService = new MailService();
  const listener = new Listener(
    playlistsService,
    playlistSongService,
    mailService
  );
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlists', { durable: true });
  await channel.consume('export:playlists', listener.listen, { noAck: true });
};

init();
