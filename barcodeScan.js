import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Camera from 'react-native-camera';

export default class BarcodeScan extends Component {

  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      currentItem: null,
      currentUpc: null,
      x: null,
      y: null,
      height: null,
      width: null
    };
    this.processBarCode = this.processBarCode.bind(this);
    this.highLightBarCode = this.highLightBarCode.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
    this.showItem = this.showItem.bind(this);
  }

  showItem() {
    if (this.state.currentItem) {
      let that = this;
      setTimeout(() => that.setState({currentItem: null}), 3000);
      let text = this.state.currentItem.id ? this.state.currentItem.product_name : `No such UPC with bar code ${this.state.currentUpc}`;
      return (
        <View style={styles.showItemstyle}>
          <Text style={{fontSize: 20}}>{text}</Text>
        </View>
      );
    } else {
      return null;
    }
  }

  highLightBarCode() {
    if (this.state.processing) {
      return (
        <View style={{position: 'absolute', left: parseFloat(this.state.x), top: parseFloat(this.state.y),
           height: 1, width: parseFloat(this.state.width),
            borderWidth: 5, borderColor: 'red'}}>
        </View>
      );
    } else {
      return null;
    }
  }

  makeRequest(data) {
    let url = 'https://server-bar-code.herokuapp.com/api/upcs/' + data;
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    let that = this;
    xhr.onload = () => {
      console.log(xhr.response);
      that.setState({processing: false, currentItem: xhr.response});

    }
    xhr.onerror = () => {
      console.log(`Error with ${url}`);
    };
    xhr.open('GET', url);
    xhr.send();
  }

  processBarCode(data) {
    if (!this.state.processing && !this.state.currentItem) {
      console.log(data);
      this.setState({processing: true,
                    x: data.bounds.origin.x,
                    y: data.bounds.origin.y,
                    height: data.bounds.size.height,
                    width: data.bounds.size.width,
                    currentUpc: data.data
      });
      this.makeRequest(data.data);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.showItem()}
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          onBarCodeRead={this.processBarCode.bind(this)}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}>
        </Camera>
        {this.highLightBarCode()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  showItemstyle: {
    marginBottom: 50
  }
});
