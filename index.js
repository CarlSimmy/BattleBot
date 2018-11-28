/* Discord bot config */
const Discord   = require('discord.js');
const config    = require('./config.json');

/* Node libs */
const fs        = require('fs');

/* JSON  lists */
const events    = require('./lists/events.json');
const titles    = require('./lists/titles.json');
const armors    = require('./lists/armors.json');
const stats     = require('./lists/stats.json');

/* On message commands */
const commands  = require('./commands/commands.js');
const profile   = require('./commands/profile.js');
const join      = require('./commands/join.js');
const addbot    = require('./commands/addbot.js');
const players   = require('./commands/players.js');
const reset     = require('./commands/reset.js');
const start     = require('./commands/start.js');
const bet       = require('./commands/bet.js');

/* Creating and authorizing bot */
const bot = new Discord.Client({disableEveryone: true});
bot.login(config.token);

/* __Global variables to track the state of the game__ */
var prevPlayerList = []; // Used for rematch functionality.
var playerList = [];
var deadPlayers = [];
var gameStatus = { started: false };
var betStatus = { open: false };
var winsNeeded = -1;
var currentRound = 0;

/* __Functions__ */
/* Add a player to the game */
function addPlayer( id, name, title, url ) {
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
    wins: 0,
    placedBets: []
  });
};

/* Get random value from an array */
const randomFrom = arr => {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Rematch functionality */
const startRematch = ( message, winsNeeded ) => {
  currentRound += 1;
  prevPlayerList.forEach(player => player.placedBets = []);
  message.channel.send('_ _');
  message.channel.send(
    new Discord.RichEmbed()
    .setColor('#428ff4')
    .setTitle(`Starting round ${currentRound}`)
  );
  playerList = JSON.parse(JSON.stringify(prevPlayerList));
  start(Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomFrom, prevPlayerList, winsNeeded, startRematch, stats, betStatus);
}

/* Check if command is allowed to run and deleting player messages to prevent cluttering */
const shouldCommandRun = ( command, message ) => {
  let shouldRun = true;
  let botMessage = '';
  
  message.delete(5000).catch(err => message.channel.send('If you want to handle command spam, please grant the bot permissions to manage messages!').then(msg => msg.delete(4000))); // Delete player message, e.g. "!join".
  
  if ( gameStatus.started && command !== 'bet' ) {
    shouldRun = false;
  }

  switch ( command ) {
    case 'commands':
      botMessage = `You can check the commands when the game has ended ${message.author}!`;
      break;
    case 'profile':
      botMessage = `Please wait with checking your profile until the current game has ended ${message.author}!`;
      break;
    case 'join':
      botMessage = `You were too slow ${message.author}! The game has already started.`;
      break;
    case 'addbot':
      botMessage = `Hold up ${message.author}, you can't add new bots when the game has already started!`;
      break;
    case 'players':
      botMessage = `Don't list players when the game has already started ${message.author}!`;
      break;
    case 'reset':
      botMessage = `Why are you trying to reset the game while it's running ${message.author}?`;
      break;
    case 'bet':
      if ( !betStatus.open ) { 
        botMessage = `You can only place bets before a round starts ${message.author}!`;
        shouldRun = false;
      }
      break;
    case 'start':
      botMessage = `Chill out ${message.author}, the game has already started!`;
      if ( playerList.length < 2 ) {
        botMessage = `Not enough players have joined to start the game. Psst... If you're all alone ${message.author} it's possible to fake some friends with !addbot.`;
        shouldRun = false;
      }
      break;
    case 'rematch':
      botMessage = `You'll have plenty of time for a rematch when the current game has ended ${message.author}!`;
      if ( prevPlayerList.length < 2 ) {
        botMessage = `${message.author}, start a normal game first with !start before you call for a rematch.`;
        shouldRun = false;
      }
      break;
  }

  !shouldRun && message.channel.send(botMessage).then(msg => msg.delete(5000));
  return shouldRun;
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
    if ( !shouldCommandRun(command, message) ) return; // If command is not supposed to run atm, return out.
    commands(Discord, bot, message);
  }

  /* COMMAND: Show personal profile for statistics/items */
  if ( command === 'profile' ) {
    if ( !shouldCommandRun(command, message) ) return;
    profile(Discord, message, stats);
  }

  /* COMMAND: The message author joins the game */
  if ( command === 'join' ) {
    if ( !shouldCommandRun(command, message) ) return;
    join(message, playerList, titles, randomFrom, addPlayer);
  }

  /* COMMAND: Adding a random player to the game (randomuser.me) */
  if ( command === 'addbot' ) {
    if ( !shouldCommandRun(command, message) ) return;
    addbot(message, playerList, titles, randomFrom, addPlayer);
  }

  /* COMMAND: List all players */
  if ( command === 'players' ) {
    if ( !shouldCommandRun(command, message) ) return;
    players(Discord, message, playerList);
  }

  /* COMMAND: Remove all listed alive and dead players */
  if ( command === 'reset' ) {
    if ( !shouldCommandRun(command, message) ) return;
    reset(message, playerList, deadPlayers);
  }
  
  /* COMMAND: Betting function for games before every round starts */
  if ( command === 'bet' ) {
    if ( !shouldCommandRun(command, message) ) return;
    bet(message, args, playerList, stats, fs);
  }  

  /* COMMAND: Start the game loop */
  if ( command === 'start' ) {
    if ( !shouldCommandRun(command, message) ) return;

    currentRound = 1; // Always starting at round 1.
    winsNeeded = args[0]; // For example !start 4 would make "4" the number of wins needed to win.
    prevPlayerList = JSON.parse(JSON.stringify(playerList)); // Deep copying array into new instance.

    message.channel.send(
      new Discord.RichEmbed()
      .setColor('#428ff4')
      .setTitle(`Starting round ${currentRound}`)
    );
    start(Discord, bot, message, events, armors, gameStatus, playerList, deadPlayers, randomFrom, prevPlayerList, winsNeeded, startRematch, stats, betStatus);
  }

  /* COMMAND: Start a new game with the same players */
  if ( command === 'rematch' ) {
    if ( !shouldCommandRun(command, message) ) return;

    prevPlayerList.forEach(player => player.wins = 0); // Reset wins
    currentRound = 0; // Reset rounds to 0 since it adds +1 in rematch function.
    startRematch(message, winsNeeded);
  }
});
