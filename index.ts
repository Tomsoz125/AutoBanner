import { config } from "dotenv";
config();

import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let banQueue: string[] = [];

const BANNED_GUILDS = [
	"867122533962350623" // testing
	// "504747822579712017", // nowipe
	// "1114882465220276336", // solos
	// "1081006965804769322", // duos
	// "1090065226017296414", // trios
	// "1006268867267530842" // quads
];
const EXEMPT_ROLES: string[] = [
	"1290621870248562718",
	"1281955931332149310",
	"1284743666014879827",
	"1292636563418775562",
	"1291546002322489467"
];

const HEADSHOT_DISCORD = "910276845310717982";
const MEMBER_ROLE = "910276845310717983";

const ROLE_MEMBERS_ENDPOINT =
	"https://discord.com/api/v10/guilds/{guildId}/roles/{roleId}/member-ids";

async function getRoleMembers(
	guildId: string,
	roleId: string
): Promise<string[]> {
	const response = await fetch(
		ROLE_MEMBERS_ENDPOINT.replace("{guildId}", guildId).replace(
			"{roleId}",
			roleId
		),
		{ headers: { Authorization: process.env.PERSONAL_TOKEN! } }
	);

	return response.json();
}

async function bulkBan(members: string[]) {
	console.log("Attempting to bulk ban " + members.length + " members");
	if (client.readyAt !== null) {
		for (const g of BANNED_GUILDS) {
			const guild = await client.guilds.fetch(g);
			if (!guild) return;

			let banningMembers: string[] = [];
			bigloop: for (const m of members) {
				const member = await guild.members
					.fetch(m)
					.catch((ignored) => {});
				if (!member) continue;

				for (const r of member.roles.cache) {
					if (EXEMPT_ROLES.includes(r[0])) continue bigloop;
				}

				if (!member.bannable) continue bigloop;
				await guild.bans.fetch();
				const existingBan = guild.bans.cache.find(
					(b) => b.user.id === member.id
				);
				if (existingBan) continue bigloop;

				banningMembers.push(m);
			}

			if (banningMembers.length === 0) {
				console.log(
					"Everybody that can be banned is already banned on " +
						guild.name
				);
				return;
			}
			const res = await guild.bans.bulkCreate(banningMembers, {
				deleteMessageSeconds: 0,
				reason: "Active headshot key"
			});
			if (!res) continue;

			console.log(
				"Bulk banned " +
					res.bannedUsers.length +
					" members from " +
					guild.name
			);
			console.log(
				"Failed to ban " +
					res.failedUsers.length +
					" members from " +
					guild.name
			);
		}
	} else {
		console.log("Queueing " + members.length + " bans");
		banQueue.push(...members);
	}
}

async function searchMembers() {
	console.log("Attempting to search for members");
	const members = await getRoleMembers(HEADSHOT_DISCORD, MEMBER_ROLE);
	if (!members) return;

	await bulkBan(members);
}

searchMembers();

setInterval(async () => {
	await searchMembers();
}, 600000 /* 10 minutes */);

client.once("ready", async () => {
	console.log("Bot is online!");
	if (banQueue.length > 0) {
		console.log("Queue has items");
		await bulkBan(banQueue);
	}
});

client.login(process.env.BOT_TOKEN!);

setTimeout(() => {}, 7000);
