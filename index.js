const Discord = require("discord.js")

/**
 * 
 * @param {object} message 
 * @param {table} pages 
 * @param {table} emojis 
 * @returns {object} Current page.
 */

module.exports = async (message, pages, emojis) => {
    if (!message) {
        throw new Error("[DiscordEasyPages]: Please provide a valid discord message.")
    }

    if (!pages) {
        return new Error("[DiscordEasyPages]: Please include pages.")
    }

    if (!emojis) {
        emojis = ["⬅", "➡"]
    }

    if (!emojis.length === 2) {
        return new Error(`[DiscordEasyPages]: Invalid number of emojis. Expected 2, got ${emojis.length}.`)
    }

    var PageNumber = 0
    const CurrentPage = await message.channel.send(pages[PageNumber])

    for (const emoji of emojis) {
        CurrentPage.edit(pages[PageNumber].setFooter("Please wait until reactions load!"))

        try {
            await CurrentPage.react(emoji)
        } catch (err) {
            CurrentPage.edit(pages[PageNumber].setFooter("Error occured."))

            return new Error(`[DiscordEasyPages]: Error reacting! Are you sure this is a valid emoji?`)
        }
    }

    CurrentPage.edit(pages[PageNumber].setFooter(`${PageNumber + 1}/${pages.length}`))

    const Filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id
    const ReactionCollector = CurrentPage.createReactionCollector(Filter, {
        time: pages.length * 2000
    })

    ReactionCollector.on("collect", reaction => {
        reaction.users.remove(message.author)

        if (reaction.emoji.name) {
            if (reaction.emoji.name === emojis[0]) {
                PageNumber = PageNumber > 0 ? --PageNumber : pages.length - 1
            } else if (reaction.emoji.name === emojis[1]) {
                PageNumber = PageNumber + 1 < pages.length ? ++PageNumber : 0
            } else {
                return
            }
        }

        CurrentPage.edit(pages[PageNumber].setFooter(`Page ${PageNumber + 1}/${pages.length}`))
    })

    ReactionCollector.on("end", () => {
        if (!CurrentPage.deleted) {
            CurrentPage.reactions.removeAll()
        }
    })

    return CurrentPage
}
