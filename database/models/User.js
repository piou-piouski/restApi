const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../connection');
const dbClient = require('../connect');

const SALT_ROUNDS = 12;

class User extends Model {
  // Compare un mot de passe en clair avec le hash stocké
  async checkPassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  // Sécurité : le hash n'est jamais renvoyé dans les réponses JSON
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      // type: DataTypes.INTEGER,
      // autoIncrement: true,
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // username: {
    //   type: DataTypes.STRING(50),
    //   allowNull: false,
    //   unique: true,
    //   validate: {
    //     notEmpty: true,
    //     len: [3, 50],
    //   },
    // },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value) {
        this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val){
        this.setDataValue('password', bcrypt.hashSync(val,10))
      },
      validate: {
        // Recommandation NIST : la longueur prime sur la complexité
        len: [8, 128],
      },
    },
    scopes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: ["me:read", "me:write"]
    },
    // role: {
    //   // Moindre privilège : tout nouvel utilisateur est un simple 'user'
    //   type: DataTypes.ENUM('user', 'admin'),
    //   allowNull: false,
    //   defaultValue: 'user',
    // },
  },
  {
    sequelize: dbClient,
    tableName: 'users'
  }
  // {
  //   sequelize,
  //   modelName: 'User',
  //   tableName: 'users',
  //   timestamps: true, // createdAt / updatedAt

  //   // Par défaut, les requêtes ne récupèrent pas le mot de passe
  //   defaultScope: {
  //     attributes: { exclude: ['password'] },
  //   },
  //   scopes: {
  //     // À utiliser uniquement pour le login : User.scope('withPassword').findOne(...)
  //     withPassword: {
  //       attributes: { include: ['password'] },
  //     },
  //   },

  //   hooks: {
  //     // Hachage du mot de passe avant insertion / modification (après la validation de longueur)
  //     beforeSave: async (user) => {
  //       if (user.changed('password')) {
  //         user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  //       }
  //     },
  //   },
  // }
);

module.exports = User;
