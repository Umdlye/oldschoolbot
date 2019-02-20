const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const he = require('he');
const Twit = require('twit');

const JAGEX_ASH = '1712662364';

/* eslint-disable no-inline-comments */
const ALL_TWITTERS = [
	/* OSRS Streamers/Youtubers */
	'940563176', // SoupRS
	'184349515', // MmorpgCP
	'557647030', // Skiddler
	'525302599', // Sick_Nerd
	'3187663593', // WooxSolo
	'2169865003', // RSAlfierules
	'1894180640', // B0atyOSRS
	'2462052530', // afriendrs
	'1634264438', // Hey_Jase
	'1569065179', // monnixxx
	'3105724056', // Lady_CatherineB
	'2307540361', // Faux_Freedom
	'2411777869', // Mr_Mammal
	'3256936132', // Dalek_Cookie
	'3318825773', // Knightenator
	'702224459491647488', // rsnRRobert
	'803844588100325376', // ZuluOnly
	'709141790503211008', // LakeOSRS
	/* OSRS Jagex Mods */
	'2726160938', // JagexCurse
	'2785100110', // JagexMaz
	'3362141061', // JagexKieren
	'3870174875', // JagexSween
	'2818884683', // JagexArchie
	'1858363524', // JagexWeath
	'2279036881', // JagexJohnC
	'1307366604', // JagexMatK
	'1205666185', // OldSchoolRS
	'2800406980', // Jagex_Ghost
	'1712662364', // JagexAsh
	'794223611297091584', // JagexLottie
	'734716002831900672', // JagexWest
	'791939828774338560', // JagexAtlas
	'786858980400390144', // JagexWolf
	'824932930787094528', // JagexLenny
	'998580261137911808', // JagexBruno
	'732227342144307200', // JagexRoq
	'740546260533383168', // JagexEd
	'849322141002727425', // JagexRy
	'1088015657982152706', // JagexTide
	'1008655742428221440', // JagexMunro
	'1001866988803772416', // JagexGambit
	'1090608917560901632', // JagexNasty
	'1067444118765412352', // JagexGee
	'889399884788453376', // JagexAcorn
	/* HCIM Deaths */
	'797859891373371392' // HCIM_Deaths
];

const JMOD_TWITTERS = [
	'1307366604',
	'1205666185',
	'3362141061',
	'3870174875',
	'2818884683',
	'1858363524',
	'2279036881',
	'2800406980',
	'1712662364',
	'2726160938',
	'2785100110',
	'791939828774338560',
	'786858980400390144',
	'824932930787094528',
	'740546260533383168',
	'998580261137911808',
	'794223611297091584',
	'734716002831900672',
	'732227342144307200',
	'849322141002727425',
	'1090608917560901632',
	'1001866988803772416',
	'1067444118765412352',
	'1088015657982152706',
	'1008655742428221440',
	'889399884788453376'
];

const STREAMER_TWITTERS = [
	'1894180640',
	'184349515',
	'3105724056',
	'2307540361',
	'557647030',
	'525302599',
	'3187663593',
	'2169865003',
	'940563176',
	'1569065179',
	'2411777869',
	'3256936132',
	'3318825773',
	'2462052530',
	'803844588100325376',
	'1634264438',
	'709141790503211008',
	'702224459491647488'
];

const HCIM_DEATHS = ['797859891373371392'];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady', enabled: true });
	}

	run() {
		const twitter = new Twit(this.client.twitterApp);

		const stream = twitter.stream('statuses/filter', { follow: ALL_TWITTERS });

		stream.on('tweet', this.handleTweet.bind(this));
	}

	handleTweet(tweet) {
		// If its a retweet, return.
		if (
			tweet.retweeted ||
			tweet.retweeted_status ||
			tweet.delete
		) {
			return;
		}

		console.log(`1 ${tweet.user.name}`);

		// If it's a reply, and the author isn't Jagex Ash, return.
		if ((tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id_str) && (tweet.user.id_str !== JAGEX_ASH)) {
			return;
		}

		console.log(`2 ${tweet.user.name}`);

		const _tweet = tweet.extended_tweet ? tweet.extended_tweet : tweet;

		const formattedTweet = {
			text: he.decode(tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text),
			url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
			name: he.decode(tweet.user.name),
			avatar: tweet.user.profile_image_url_https,
			image: (_tweet.entities.media && _tweet.entities.media[0].media_url_https) || null,
			id: tweet.user.id_str,
			isReply: Boolean(tweet.in_reply_to_status_id_str || tweet.in_reply_to_user_id_str)
		};

		this.sendTweet(formattedTweet);
	}

	sendTweet({ text, url, name, avatar, image, id, isReply }) {
		console.log({ text, url, name, avatar, image, id, isReply });
		const embed = new MessageEmbed()
			.setDescription(`\n ${text}`)
			.setColor(1942002)
			.setThumbnail(avatar)
			.setAuthor(name)
			.setImage(image);

		let key;
		if (JMOD_TWITTERS.includes(id)) key = 'tweetchannel';
		if (STREAMER_TWITTERS.includes(id)) key = 'streamertweets';
		if (HCIM_DEATHS.includes(id)) key = 'hcimdeaths';
		if (isReply && id === JAGEX_ASH) key = 'ashTweetsChannel';

		console.log(key);
		if (!key) return;
		this.client.guilds.filter(guild => guild.settings.get(key))
			.map(guild => {
				const channel = guild.channels.get(guild.settings.get(key));
				if (channel) channel.send(`<${url}>`, { embed }).catch(() => null);
			});
	}

};
