module.exports = ( Discord, message, stats ) => {
  let profileEmbed = new Discord.RichEmbed()
    .setColor('#428ff4')
    .setAuthor(message.member.displayName)
    .setThumbnail(message.author.displayAvatarURL)
    .setDescription(`*Statistics*:
    Total wins: **${stats[message.author.id] ? stats[message.author.id].wins : 0}**
    
    *Items*:
    Coins: **${stats[message.author.id] ? stats[message.author.id].coins : 0}**`);

  return message.channel.send(profileEmbed).then(msg => msg.delete(20000));
}