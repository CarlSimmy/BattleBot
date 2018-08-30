/* Discord bot config */
const Discord   = require('discord.js');
const config    = require('./config.json');

/* JSON  lists */
const events    = require('./events.json');
const titles    = require('./titles.json');
const armors    = require('./armors.json');

/* On message commands */
const commands  = require('./commands/commands.js');
const join      = require('./commands/join.js');
const addbot    = require('./commands/addbot.js');
const players   = require('./commands/players.js');
const reset     = require('./commands/reset.js');
const start     = require('./commands/start.js');

/* Creating and authorizing bot */
const bot = new Discord.Client({disableEveryone: true});
bot.login(config.token);

/* __Global variables to track the state of the game__ */
var prevPlayerList = []; // Used for rematch functionality.
var playerList = [];
var deadPlayers = [];
var gameStatus = { started: false };
var winsNeeded = -1;

/* __Functions__ */
/* Add a player to the game */
function addPlayer(id, name, title, url) {
  playerList.push({
    id,
    health: 100,
    name,
    title,
    url,
    equipment: {
      armor: {
        name: '',
        value: 0
      }
    },
    wins: 0
  });
};

/* Get random value from an array */
const randomFrom = arr => {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Rematch functionality */
const startRematch = (message, winsNeeded) => {
  message.channel.send('_ _');
  message.channel.send('**Starting a new game with the same players!**');
  message.channel.send('_ _');
  playerList = JSON.parse(JSON.stringify(prevPlayerList));
  start(Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomFrom, prevPlayerList, winsNeeded, startRematch);
}

/* Bot start */
bot.on('ready', async() => {
  console.log(`${bot.user.username} is online`);
  bot.user.setActivity('!commands');
});

/* Bot check when a message is typed into the channel */
bot.on('message', async message => {
  if ( message.author.bot || message.channel.type === 'dm' ) return; // Can't run commands from other bots or direct messages.
  const pfx = config.prefix;
  const args = message.content.slice(pfx.length).trim().split(/ +/g);
  let command = '';
  if ( message.content[0] === pfx ) {
    command = args.shift().toLowerCase();
  }

  /* COMMAND: Show information and available commands */
  if ( command === 'commands' ) {
    if ( gameStatus.started ) return message.channel.send(`You can check the commands when the game has ended ${message.author}!`);
    commands(Discord, bot, message);
  }

  /* COMMAND: The message author joins the game */
  if ( command === 'join' ) {
    if ( gameStatus.started ) return message.channel.send(`You were too slow ${message.author}! The game has already started.`);
    join(message, playerList, titles, randomFrom, addPlayer);
  }

  /* COMMAND: Adding a random player to the game (randomuser.me) */
  if ( command === 'addbot' ) {
    if ( gameStatus.started ) return message.channel.send(`Hold up ${message.author}, you can't add new bots when the game has already started!`);
    addbot(message, playerList, titles, randomFrom, addPlayer);
  }

  /* COMMAND: List all players */
  if ( command === 'players' ) {
    if ( gameStatus.started ) return message.channel.send(`Don't list players when the game has already started ${message.author}!`);
    players(Discord, message, playerList);
  }

  /* COMMAND: Remove all listed alive and dead players */
  if ( command === 'reset' ) {
    if ( gameStatus.started ) return message.channel.send(`Why are you trying to reset the game while it's running ${message.author}?`);
    reset(message, playerList, deadPlayers);
  }

  /* COMMAND: Start the game loop */
  if ( command === 'start' ) {
    winsNeeded = args[0]; // For example !start 4 would make "4" the number of wins needed to win.
    if ( gameStatus.started ) return message.channel.send(`Chill out ${message.author}, the game has already started!`);
    if ( playerList.length < 2 ) return message.channel.send(`Not enough players have joined to start the game. Psst... If you're all alone ${message.author} it's possible to fake some friends with !addbot.`);
    prevPlayerList = JSON.parse(JSON.stringify(playerList)); // Deep copying array into new instance.
    start(Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomFrom, prevPlayerList, winsNeeded, startRematch);
  }

  /* COMMAND: Start a new game with the same players */
  if ( command === 'rematch' ) {
    if ( gameStatus.started ) return message.channel.send(`You'll have plenty of time for a rematch when the current game has ended ${message.author}!`);
    if ( prevPlayerList.length < 2 ) return message.channel.send(`${message.author}, start a normal game first with !start before you call for a rematch.`);
    prevPlayerList.forEach(player => player.wins = 0); // Reset wins
    startRematch(message, winsNeeded);
  }
});