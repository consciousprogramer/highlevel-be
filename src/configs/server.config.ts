export const serverConfig = {
	port: process.env.PORT || 3000,
	limits: {
		jsonReqBody: "100mb",
	},
	CORS: {
		ALLOWED_METHODS: "PUT, GET, POST, DELETE, OPTIONS,PATCH",
		ALLOWED_HEADERS: "Content-Type,Authorization",
		EXPOSE_HEADERS: "",
	},
}
