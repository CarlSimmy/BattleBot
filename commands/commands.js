module.exports = ( Discord, bot, message ) => {
  let infoEmbed = new Discord.RichEmbed()
    .setColor('#428ff4')
    .setAuthor(bot.user.username)
    .setDescription(`*Battle Royale/Hunger Games Bot* \n
  Commands available: \n
  **!join** - Joins the current game round \n
  **!addbot** - Add a random player to the game \n
  **!players** - Lists all active players for the round \n
  **!reset** - Removes all of the players from the current round \n
  **!start [number]** - Starts a new game of first to [number] of wins. Default is one win \n
  **!rematch** - Starts a new game round with the players from the previous round \n
  **!profile** - Outputs your personal player profile, currently showing statistics`)
    .setThumbnail(bot.user.avatarURL)
    .setFooter('~ Made by Simmy');

  return message.channel.send(infoEmbed).then(msg => msg.delete(20000));
}