module.exports = {
  run: ( Discord, bot, message ) => {
    let infoEmbed = new Discord.RichEmbed()
      .setColor('#428ff4')
      .setAuthor(bot.user.username)
      .setDescription(`*Battle Royale/Hunger Games Bot* \n
    Commands available: \n
    **!join** - Joins the current game round \n
    **!addbot** - Add a random player to the game \n
    **!players** - Lists all active players for the round \n
    **!reset** - Removes all of the players from the current round \n
    **!start** - Starts a new game round with the active players \n
    **!rematch** - Starts a new game round with the players from the previous round`)
      .setThumbnail(bot.user.avatarURL)
      .setFooter('~ Made by Simmy');
  
    return message.channel.send(infoEmbed);
  }
};