class NodeMonitorInput extends React.Component
{
	constructor(props){
		super(props);
		this.state = {value: ''};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleChange(event){
		this.setState({value: event.target.value});
	}
	handleSubmit(event){
		if (event.key == 'Enter'){
			this.props.onEnterPressed(this.state.value);
		}
	}
	render(){
		return React.createElement('input', {type:"search", placeholder:"ip address", value:this.state.value, onChange:this.handleChange, onKeyPress:this.handleSubmit}, null);
	}
}
class NodeMonitorItem extends React.Component{
	constructor(props){
		super(props);
		this.deleteClicked = this.deleteClicked.bind(this);
		this.checkStatus = this.checkStatus.bind(this);	
	}
	deleteClicked(){
		this.props.onDeleteClicked(this.props.text);
	}
	checkStatus(){
		  var xhttp = new XMLHttpRequest();
			var that = this;
  		xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
				if (this.responseText == "\"ENABLED\"" || this.responseText == "\"PRE_ENABLED\"")
				{
     			document.getElementById(that.props.text).className = 'goodstate';
				}
				else if (this.responseText == ""){
     			document.getElementById(that.props.text).className = 'notfound';
				}
				else{
     			document.getElementById(that.props.text).className = 'badstate';
				}
    	}
			else{
				console.log("failed to connect to server");
			}
  	};
  	xhttp.open("GET", "http://23.226.231.92/smartnode/"+this.props.text, true);
  	xhttp.send();
	}
	render(){
		var iconpath = chrome.extension.getURL('icons/126497.png');
		const buttonStyle = {
			"height":"10px",
			"margin-left":"5px"
		}

		var crossbutton = React.createElement("img", {src:iconpath, style:buttonStyle, onClick:this.deleteClicked}, null);
		this.checkStatus();
		return React.createElement("li", {id:this.props.text, className:this.props.class}, this.props.text, crossbutton);
		//return React.createElement('li', null, this.props.text);
	}
}
class NodeMonitorList extends React.Component{
	constructor(props){
		super(props)
		chrome.storage.sync.get(["smartnodes"], function (items){
			 this.refreshList(items.smartnodes);
		}.bind(this));
		this.addItem = this.addItem.bind(this);
		this.state = {currentList: this.showsmartnodes }
		this.refreshList = this.refreshList.bind(this);
		this.removeItem = this.removeItem.bind(this);
	}
	refreshList(items)
	{

		if (typeof items != 'undefined')
		{
			this.smartnodes = items;
				this.state.currentList = [];
				for (var e in items){
					this.state.currentList.push(React.createElement(NodeMonitorItem, {text:items[e].text, class:items[e].status, onDeleteClicked:this.removeItem}, null));
				}
		 		this.forceUpdate();
		}
		else
		{
				this.smartnodes = [];
		}
	}
	addItem(itemText)
	{
		 	if (typeof this.smartnodes == 'undefined')
			{
				this.smartnodes = [];
			}
		 	else{
				if(!this.findItemInList(this.smartnodes, itemText))
				{
					if(this.validateIPaddress(itemText))
					{
						this.smartnodes.push({text:itemText, status:'unknown'});
						chrome.storage.sync.set({"smartnodes":this.smartnodes}, function(){});
						this.refreshList(this.smartnodes);
					}
				}
				else{
					//flash original item
     			document.getElementById(itemText).className += ' alreadyexist';
					var existitemtext = itemText;
					setTimeout(function(){
						 var item = document.getElementById(existitemtext);
						if (typeof item != undefined)
						{
							item.classList.remove('alreadyexist');
						}
					}.bind(this), 200);
				
				}
			}

	}
	removeItem(text){
		for (var index in this.smartnodes){
				if (this.smartnodes[index].text == text){
					this.smartnodes.splice(index,1);
				}
		}
		chrome.storage.sync.set({"smartnodes":this.smartnodes}, function(){});
		this.refreshList(this.smartnodes);
	}
	findItemInList(items, itemtext){
		for (var index in items)
		{
			if (items[index].text == itemtext){
				return true;
			}
		}
		return false;
	}
	validateIPaddress(ipaddress) {
  		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    	return true;
  	}
  	console.log("You have entered an invalid IP address!");
  	return false;
	}
	render(){
			return React.createElement('div', null,
												React.createElement('p', null, 'SmartNodes:'),
												React.createElement('ul',null, this.state.currentList),
												React.createElement(NodeMonitorInput, {onEnterPressed:this.addItem}, null)

			)
	}
}
ReactDOM.render(React.createElement(NodeMonitorList, null, null), document.getElementById('monitor'));
