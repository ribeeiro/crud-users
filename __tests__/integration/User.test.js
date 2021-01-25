const request = require("supertest");
const app = require("../../src/app");
const firstUser = require("../../src/constants/user");
const PasswordToken = require("../../src/Models/PasswordToken");
const User = require("../../src/Models/User");

describe("POST /user", () => {
  it("Should return 400 if neither email, nor password nor name were sent ", async (done) => {
    const payload = {
      email: "test@testing.com",
    };

    await request(app).post("/user").send(payload).expect(400);
    done();
  });

  it("Should return 422 if email is already registered", async (done) => {
    const { email, password, name } = firstUser;

    await request(app)
      .post("/user")
      .send({ email, password, name })
      .expect(422);
    done();
  });

  it("Should return 201 if the payload was sent correctly", async (done) => {
    const payload = {
      name: "thiago",
      email: "thiagogr71@gmail.com",
      password: "strongpassword123",
    };

    await request(app).post("/user").send(payload).expect(201);
    done();
  });
});

describe("GET /user", () => {
  it("Should return an array of all users", async (done) => {
    const { email, name, role, id } = firstUser;

    const res = await request(app).get("/user").expect(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toStrictEqual({ email, name, role, id });
    done();
  });
});

describe("GET /user/:id", () => {
  it("Should return info about the user with the id that was passed", async (done) => {
    const { email, role, name, id } = firstUser;

    const res = await request(app).get("/user/1").expect(200);
    expect(res.body).toStrictEqual({ email, name, id, role });
    done();
  });

  it("Should return 400 if the id is NaN", async (done) => {
    await request(app).get("/user/string").expect(400);
    done();
  });

  it("Should return 404 if the user doesn't exist", async (done) => {
    await request(app).get("/user/35").expect(404);
    done();
  });
});

describe("PUT /user/:id", () => {
  it("Should return 400 if the id is NaN", async (done) => {
    await request(app).put("/user/asdad").expect(400);
    done();
  });

  it("Should return 400 if no payload is sent and user exists", async (done) => {
    await request(app).put("/user/1").expect(400);
    done();
  });

  it("Should return 404 if the user doesn't exist", async (done) => {
    const payload = {
      email: "mymail@myemail.com",
    };

    await request(app).put("/user/32").send(payload).expect(404);
    done();
  });

  it("Should return 200 if user exists and payload is provided", async (done) => {
    const payload = {
      email: "novoemail@email.com",
    };

    await request(app).put("/user/1").send(payload).expect(200);
    done();
  });
});

describe("DELETE /user/:id", () => {
  it("Should 404 if the user doesn't exist", async (done) => {
    await request(app).delete("/user/32").expect(404);
    done();
  });

  it("Should return 200 if the user was deleted", async (done) => {
    await request(app).delete("/user/1").expect(200);
    done();
  });

  it("Should return 400 if the id is NaN", async (done) => {
    await request(app).delete("/user/abc").expect(400);
    done();
  });
});

describe("POST /user/recovery", () => {
  it("Should return 404 if the email doesn't exist in the db", async (done) => {
    const payload = {
      email: "idont@exist.com",
    };

    await request(app).post("/user/recovery").send(payload).expect(404);
    done();
  });

  it("Should return 400 if the email was not sent", async (done) => {
    await request(app).post("/user/recovery").expect(400);
    done();
  });

  it("Should return 201 if the email exists", async (done) => {
    const payload = {
      email: "thiagogr71@gmail.com",
    };

    await request(app).post("/user/recovery").send(payload).expect(201);
    done();
  });
});

describe("POST /user/recovery/:id", () => {
  it("Should return 400 if an invalid token is sent", async (done) => {
    const payload = {
      password: "newPassword",
      token: "invalid",
    };

    await request(app).post("/user/recovery/4").send(payload).expect(400);
    done();
  });

  it("Should return 400 if a field is empty", async (done) => {
    const payload = {
      password: "newpassword",
    };

    await request(app).post("/user/recovery/4").send(payload).expect(400);
    done();
  });

  it("Should return 200 if the token is valid", async (done) => {
    const user = await User.findAll();
    const { email, id } = user[0];
    const { token } = await PasswordToken.generateToken(email);
    const payload = {
      password: "StrongestPassword",
      token,
    };

    await request(app).post(`/user/recovery/${id}`).send(payload).expect(200);
    done();
  });
});
