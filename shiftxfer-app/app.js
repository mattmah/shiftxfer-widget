(function() {

  return {

    // Here we define AJAX calls
    requests: {

      getTaggedTickets: function(tag) {
        return {
          url: '/api/v2/search.json?query=tags:'+tag,
          type: 'GET'
        };
      },

      getTicketForAdd: function(ticketId) {
        return {
          url: '/api/v2/tickets/' + ticketId + '.json',
          type: 'GET'

        };
      },

      getTicketForDelete: function(ticketId) {
        return {
          url: '/api/v2/tickets/' + ticketId + '.json',
          type: 'GET'

        };
      },

      updateTicket: function(ticketId,params) {
        return {
          url: '/api/v2/tickets/' + ticketId + '.json',
          type: 'PUT',  
          dataType: "json",
          data: params
        };
      }

    },

    // Here we define events such as a user clicking on something
    events: {

      // The app is active, so call requestGetTaggedTickets
      'app.activated': 'requestGetTaggedTickets',

      'getTaggedTickets.done': function(data) {
        this.renderTaggedTickets(data);
      },

      'getTicketForAdd.done': function(data) {
        var ticketObj = data;
        var tagArray = ticketObj.ticket.tags;
        tagArray.push('shiftxfer');

        //now that we have prepared the tagArray let's update the requested ticketId
        var params = {"ticket": {"tags":tagArray}};
        this.ajax('updateTicket',ticketObj.ticket.id,params);
      },

      'getTicketForDelete.done': function(data){
        var ticketObj = data;
        var tagArray = ticketObj.ticket.tags;
        
        //remove shiftxfer tag from tag array
        var index = tagArray.indexOf('shiftxfer');
        tagArray.splice(index,1);

        //now that we have prepared the tagArray let's update the requested ticketId
        var params = {"ticket": {"tags":tagArray}};
        this.ajax('updateTicket',ticketObj.ticket.id,params);

      },

      'click #shiftxfer-add-ticket-btn': function() {
        this.addTicket();
      },

      'click .delete-ticket': function(e) {
        var ticketId = e.currentTarget.id;
        this.deleteTicket(ticketId);
        return false;
      },

      'updateTicket.done': function() {
        this.$('#shiftxfer-message').html('Successfully updated ticket! It may take between 2-3 minutes before the change is reflected up in the list.');
        this.$('#shiftxfer-add-ticket-txt').val('');
        this.$('.spinner').hide();
      },

      'updateTicket.fail': function() {
        services.notify(this.I18n.t('update.failed', { id: this.ticket().id() }), 'error');
      },

      'click #shiftxfer-refresh-ticket-btn': 'requestGetTaggedTickets'

    },

    // Below this point, you're free to define your own functions used by the app

    
    requestGetTaggedTickets: function() {
      // Make a request called getTaggedTickets
      this.ajax('getTaggedTickets','shiftxfer');
    },

    renderTaggedTickets: function(tickets) {
  
      this.tickets = tickets;
      this.switchTo('list', {
        tickets:this.tickets
      });

      this.$('#shiftxfer-message').html('loading tickets...');
      this.$('.spinner').show();
      if(tickets.count > 0)
      {
        var ticketListHTML = '<ul>';
        for(var i=0;i<tickets.count;i++) {
          //console.log(tickets.results[i]);
          var ticketId = tickets.results[i].id;
          var ticketPriority = tickets.results[i].priority;
          //var ticketTitle = tickets.results[i].subject + ' :: ' + tickets.results[i].description;
          var ticketTitle = tickets.results[i].subject;
          ticketTitle.replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          ticketListHTML += '<li><a class="shiftxfer-tix" href="/agent/#/tickets/' + ticketId + '" title="' + ticketTitle + '">' + ticketId + '</a> - <span class="ticket-priority ticket-priority-' + ticketPriority + '">' + ticketPriority + '</span> - <a href="#" class="delete-ticket" id="' + ticketId + '" >remove</a></li>';
        }
        ticketListHTML += '</ul>';

        this.$('#shiftxfer-ticketlist').html(ticketListHTML);
        this.$('#shiftxfer-message').html('');
        this.$('.shiftxfer-tix').tooltip({ hide: { effect: "explode", duration: 1000 } });
      }
      else
      {
        this.$('#shiftxfer-message').html('There are no tagged tickets.');
      }

      //show spinner for 3 seconds so people think something is happening!
      setTimeout(function(){this.$('.spinner').hide();},2000);
      
    },

    addTicket: function() {

      this.$('.spinner').show();

      //verify the text input is correct format for a ticket id
      var theString = this.$('#shiftxfer-add-ticket-txt').val();

      var myPattern = /(^[0-9]{5}$)/;   //accept only ticket ids that are made up of 5 consecutive numbers
      var match,ticketId;
      if( (match=myPattern.exec(theString)) !== null ){
        //the given string is a valid ticketId, proceed
        ticketId = match[1];

        //in order to add a new tag we must first get all the tags for this ticket and then add the new tag
        //if we just added the new tag all of the other tags would be wiped out

        //get current tags for this ticketId
        var ticketURL = '/api/v2/tickets/' + ticketId + '.json';
        this.ajax('getTicketForAdd',ticketId);

      } else {
        this.$('#shiftxfer-message').html('Please enter a valid ticket number');
        this.$('.spinner').hide();
      }

    },

    deleteTicket: function(ticketId) {
      this.$('.spinner').show();

      //get current tags for this ticketId
      var ticketURL = '/api/v2/tickets/' + ticketId + '.json';
      var tagArray;
      this.ajax('getTicketForDelete',ticketId);
    }

  };

}());
