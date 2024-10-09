import { config } from "dotenv";
config();

const BANNED_GUILDS = ["867122533962350623"];

const HEADSHOT_DISCORD = "910276845310717982";
const MEMBER_ROLE = "910276845310717983";

const ROLE_MEMBERS_ENDPOINT =
	"https://discord.com/api/v9/guilds/{guildId}/roles/{roleId}/member-ids";
const BULK_BAN_ENDPOINT =
	"https://discord.com/api/v9/guilds/{guildId}/bulk-ban";

async function getRoleMembers(guildId: string, roleId: string) {
	const response = await fetch(
		ROLE_MEMBERS_ENDPOINT.replace("{guildId}", guildId).replace(
			"{roleId}",
			roleId
		),
		{ headers: { Authorization: process.env.PERSONAL_TOKEN! } }
	);

	return response.json();
}

async function bulkBanMembers(guildId: string, members: string[]) {
	const data = { delete_message_seconds: 0, user_ids: members };

	const response = await fetch(
		BULK_BAN_ENDPOINT.replace("{guildId}", guildId),
		{
			headers: { Authorization: process.env.PERSONAL_TOKEN! },
			method: "POST",
			// @ts-ignore
			body: data
		}
	);

	return response.json();
}

const members = getRoleMembers(HEADSHOT_DISCORD, MEMBER_ROLE).then((res) => {
	for (const g of BANNED_GUILDS) {
		bulkBanMembers(g, res).then((banned) => {
			for (const b in banned.banned_users) {
			}
		});
	}
});

setTimeout(() => {}, 5000);
