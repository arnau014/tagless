'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return new Promise(function(resolve,reject)
    {
      queryInterface.addColumn('Users', 'pictureLink', {type: Sequelize.STRING});
      queryInterface.addColumn('Users', 'description', {type: Sequelize.STRING});
    });

  },

  down: (queryInterface, Sequelize) => {

    return queryInterface.removeColumn('Users', 'pictureLink')
        .then(function() {queryInterface.removeColumn('Users', 'description')} );
  }
};
