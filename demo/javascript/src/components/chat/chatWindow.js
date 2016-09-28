var React = require("react");
var SendWrapper = require('./sendwrapper');
var Notify = require('../common/notify');
var Avatar = require('../common/avatar');
var Operations = require('./operations');

module.exports = React.createClass({
    owner: null,
    getInitialState: function () {
        var me = this;
        //only group window
        if (this.props.winType == 'group') {
            if (WebIM.config.isWindowSDK) {
                WebIM.doQuery('{"type":"groupOwners","id":"' + me.props.roomId + '"}',
                    function success(str) {
                        var members = eval('(' + str + ')');
                        if (members && members.length > 0) {
                            me.owner = members;
                            var jid = members[0].jid;
                            var username = jid.substring(jid.indexOf('_') + 1).split('@')[0];
                            if (members[0].affiliation == 'owner' && username == Demo.user) {
                                me.setState({admin: 1});
                            }
                        }
                    },
                    function failure(errCode, errMessage) {
                        Notify.error("queryRoomInfo:" + errCode);
                    });
            } else {
                Demo.conn.queryRoomInfo({
                    roomId: me.props.roomId,
                    success: function (members) {
                        if (members && members.length > 0) {
                            me.owner = members;
                            var jid = members[0].jid;
                            var username = jid.substring(jid.indexOf('_') + 1).split('@')[0];
                            if (members[0].affiliation == 'owner' && username == Demo.user) {
                                me.setState({admin: 1});
                            }
                        }
                    },
                    error: function () {
                        Notify.error('queryRoomInfo error', me.props.roomId);
                    }
                });
            }
        }
        return {
            admin: 0,
            members: [],
            memberShowStatus: false
        };
    },

    componentWillReceiveProps: function (nextProps) {

    },

    listMember: function () {
        if (this.refs.i.className.indexOf('up') < 0) {
            var me = this;
            if (WebIM.config.isWindowSDK) {
                WebIM.doQuery('{"type":"groupMembers","id":"' + me.props.roomId + '"}',
                    function success(str) {
                        var members = eval('(' + str + ')');
                        if (members && members.length > 0) {
                            me.refreshMemberList(members);
                        }
                    },
                    function failure(errCode, errMessage) {
                        Notify.error("listMember:" + errCode);
                    });
            } else {
                Demo.conn.queryRoomMember({
                    roomId: me.props.roomId,
                    success: function (members) {
                        if (members && members.length > 0) {
                            me.refreshMemberList(members);
                        }
                    },
                    error: function () {
                    }
                });
            }
        } else {
            this.refs.i.className = 'webim-down-icon font smallest dib';
            this.setState({members: [], memberShowStatus: false});
        }
    },

    refreshMemberList: function (members) {
        console.log('refreshMemberList');
        console.log(this.owner);
        console.log(members);
        this.refs.i.className = 'webim-down-icon font smallest dib webim-up-icon';
        this.setState({members: this.owner.concat(members), memberShowStatus: true});
    },
    send: function (msg) {
        Demo.conn.send(msg);
        Demo.api.appendMsg(msg, 'txt');
    },

    render: function () {
        var className = this.props.roomId ? ' dib' : ' hide',
            props = {
                sendPicture: this.props.sendPicture,
                sendAudio: this.props.sendAudio,
                sendFile: this.props.sendFile
            },
            memberStatus = this.state.memberShowStatus ? '' : ' hide',
            roomMember = [];


        for (var i = 0, l = this.state.members.length; i < l; i++) {
            var jid = this.state.members[i].jid,
                username = jid.substring(jid.indexOf('_') + 1).split('@')[0];

            roomMember.push(<li key={i}>
                <Avatar src='demo/images/default.png'/>
                <span>{username}</span>
            </li>);
        }


        return (
            <div className={'webim-chatwindow ' + this.props.className}>
                <div className='webim-chatwindow-title'>
                    {this.props.name}
                    <i ref='i' className={'webim-down-icon font smallest' + className} onClick={this.listMember}>D</i>
                </div>
                <div className={this.props.showOptions ? '' : 'hide'}>
                    <Operations roomId={this.props.roomId} admin={this.state.admin}/>
                </div>
                <ul ref='member' className={'webim-group-memeber' + memberStatus}>{roomMember}</ul>
                <div id={this.props.id} ref='wrapper' className='webim-chatwindow-msg'></div>
                <SendWrapper send={this.send} {...props} />
            </div>
        );
    }
});
