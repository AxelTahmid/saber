import bcrypt from "bcryptjs";

import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

function fastifyBcrypt(
	fastify: FastifyInstance,
	opts: { saltWorkFactor: number },
	done: () => void
) {
	const saltWorkFactor = opts.saltWorkFactor || 10;

	const hash = async (pwd: string) => bcrypt.hash(pwd, saltWorkFactor);

	const compare = async (claim1: string, claim2: string) =>
		bcrypt.compare(claim1, claim2);

	fastify.decorate("bcrypt", {
		hash,
		compare,
	});

	done();
}

export default fp(fastifyBcrypt, {
	name: "bcrypt",
});
