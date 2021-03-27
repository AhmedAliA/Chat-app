/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Dimensions
} from 'react-native';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class Preloading extends Component {
    render() {
        const {
            show,
        } = this.props
        if (show) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size={'large'} color="#f4811e" />
                </View>
            );
        }
        return null;
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0
    },
});
