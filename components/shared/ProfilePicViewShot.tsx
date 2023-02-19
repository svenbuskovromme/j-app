import axios from "axios";
import { api, userPlaceRow, userRow } from "jungle-shared";
import React, { createRef, FC, forwardRef, ForwardRefRenderFunction, MutableRefObject, PropsWithChildren, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react"
import { FunctionComponent } from "react";
import { Dimensions, GestureResponderEvent, Image, Platform, View } from "react-native"
import { launchImageLibrary } from "react-native-image-picker";

import ViewShot from "react-native-view-shot";
import RNFS from 'react-native-fs';
import { store } from "redux/store";
import { getSource, source } from "utils";
import Svg, { Path } from "react-native-svg";
import { getPermission, PermissionKey } from "redux/app";
import { updatePhotoTimestamp } from "redux/user";
import { PERMISSIONS } from "react-native-permissions";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import UserAvatar from "./UserAvatar";

type Props = {onDirty?(valid: boolean): void};
type State = {profilePic: string, dirty: boolean};

// export class  ProfilePicViewShot extends React.Component<Props, State> {
//     constructor(props: Props){
//         super(props);

//         const user = store.getState().user.user;

//         if(!user)
//             throw 'must be logged in to set profile pic';

//         this.user = user;

//         this.state = {
//             profilePic: getSource(this.user.id, 'user'),
//             dirty: false
//         }
//     }
//     private profilePicViewRef = createRef<View>() as RefObject<View>;
//     private viewshotRef = createRef<ViewShot>() as RefObject<ViewShot>;
//     private user: userRow;

//     // const [profilePic, setProfilePic] = useState<string>();

//     private getTouchCenter = (e: GestureResponderEvent) => 
//         e.nativeEvent.touches.length === 2 ? 
//             [(e.nativeEvent.touches[0].pageX + e.nativeEvent.touches[1].pageX) / 2, (e.nativeEvent.touches[0].pageY + e.nativeEvent.touches[1].pageY) / 2] : 
//         e.nativeEvent.touches.length === 1 ?
//             [e.nativeEvent.touches[0].pageX, e.nativeEvent.touches[0].pageY] : 
//         [e.nativeEvent.pageX,e.nativeEvent.pageY];

//     private getPointVectors = (a: number[], b: number[]) => [b[0] - a[0], b[1] - a[1]];
//     private getPointDistance = (a: number, b: number) => Math.sqrt(a * a + b * b);
//     private getTouchDistance = (e: GestureResponderEvent) => 
//         e.nativeEvent.touches.length === 2 ? this.getPointDistance(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX, e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY) : 0;
//     private touchCenterRef = [0,0];
//     private touchDistanceRef = 0;
//     private touchMoveCount = 0;

//     // private touchStart = (e: GestureResponderEvent) => {
//     //     this.touchCenterRef = this.getTouchCenter(e);

//     //     if(e.nativeEvent.touches.length === 1)
//     //         this.touchMoveCount = 0;
//     // }

//     // private touchMove = (e: GestureResponderEvent) => {
//     //     if(this.state.profilePic){
//     //         const newCenter = this.getTouchCenter(e);
            
//     //         const moved = this.getPointVectors(this.touchCenterRef, newCenter);

//     //         if(e.nativeEvent.touches.length === 2){
//     //             const bounds = Dimensions.get('window');
//     //             const newDistance = this.getTouchDistance(e);
//     //             const scale = this.touchDistanceRef === 0 ? 1 : newDistance / this.touchDistanceRef;
//     //             this.touchDistanceRef = newDistance;

//     //             this.scaleRef *= scale;

//     //             if(scale !== 1 && !this.state.dirty)
//     //                 this.setDirty();
//     //         }
            
//     //         this.touchCenterRef = newCenter;
            
//     //         this.xRef += moved[0];
//     //         this.yRef += moved[1];

//     //         this.touchMoveCount++;

//     //         this.profilePicViewRef.current?.setNativeProps({transform: this.getTransform()});

//     //         if((moved[0] !== 0 || moved[1] !== 0) && !this.state.dirty)
//     //             this.setDirty();
//     //     }
//     // }

//     private setDirty(){
//         this.setState({dirty: true});
//         this.props.onDirty && this.props.onDirty();
//     }

//     // private touchEnd = (e: GestureResponderEvent) => {
//     //     this.touchCenterRef = this.getTouchCenter(e);
//     //     this.touchDistanceRef = 0;

//     //     if(this.touchMoveCount < 1){
            
//     //         checkSystemPermission(PERMISSIONS.IOS.PHOTO_LIBRARY).then(permission => {
//     //             if(permission){
//     //                 launchImageLibrary({
//     //                     mediaType: 'photo'}, photo => {
//     //                     if(photo.assets?.length === 1){
//     //                         this.setState({profilePic: photo.assets![0].uri!, dirty: true});
//     //                         this.props.onDirty && this.props.onDirty();
//     //                     }
//     //                 });
//     //             }
//     //         });
//     //     }
//     // }

//     private getTransform = () => [{translateX: this.xRef}, {translateY: this.yRef}, {scale: this.scaleRef}];

//     public capture = async () => await this.viewshotRef.current!.capture!();

//     public save = async () => {
//         const tmpFile = await this.capture();

//         const _file = await axios.get(tmpFile, {responseType: 'arraybuffer'});

//         await fetch(api.baseUrl + `/api/photo/user/${this.user!.id}`, {
//             method: 'post',
//             body: _file.data,
//             headers: {...api.getHeaders(), 'Content-Type': 'multipart/form-data'}
//         });
        
//         store.dispatch(updatePhotoTimestamp(Date.now()));

//         await RNFS.unlink(tmpFile);
//     }

//     public render(){
//         // return <View onTouchStart={this.touchStart} onTouchMove={this.touchMove} onTouchEnd={this.touchEnd} style={{width: 300, height: 300, alignItems: 'center', justifyContent: 'center'}}>
//         return <TouchArea>
//             <View style={{width: 235, height: 235, borderRadius: 235/2, borderStyle: 'solid', borderColor: '#FCFAEE', borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}>
//                 <ViewShot ref={this.viewshotRef} style={{width: '100%', height: '100%'}}>
//                     {
//                         (!!this.state.profilePic || this.user.signInStep > 1) &&
//                         <View ref={this.profilePicViewRef} style={{position: 'absolute', width: 235, height: 235, transform: this.getTransform()}}>
//                             <Image 
//                                 source={{uri: this.state.profilePic, headers: api.getHeaders()}} style={{width: '100%', height: '100%'}}
//                                 onLoad={() => {
//                                     if(this.state.profilePic)
//                                         this.setDirty();
//                                 }}
//                                 onError={e => {
//                                     this.setState({profilePic: ''});
//                                 }}
//                             />
//                         </View>
//                     }
//                 </ViewShot>
//                 <Svg style={{position: 'absolute', top: (235 - 24)/2, left: (235 - 24)/2 }}>
//                     <Path d="M0 12 L24 12" stroke="#FCFAEE" strokeWidth="2"></Path>
//                     <Path d="M12 0 L12 24" stroke="#FCFAEE" strokeWidth="2"></Path>
//                 </Svg>
//             </View>  
//         </TouchArea>
//         // </View>;
//     }

// }

export type ProfilePicViewShotHandle = {
    save(): Promise<void>
}

const ProfilePicViewShot: ForwardRefRenderFunction<ProfilePicViewShotHandle, PropsWithChildren & Props> = ({onDirty}, ref) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);
    const ts = useAppSelector(state => state.user.photoTS);

    const getTouchCenter = (e: GestureResponderEvent) => 
        e.nativeEvent.touches.length === 2 ? 
            [(e.nativeEvent.touches[0].pageX + e.nativeEvent.touches[1].pageX) / 2, (e.nativeEvent.touches[0].pageY + e.nativeEvent.touches[1].pageY) / 2] : 
        e.nativeEvent.touches.length === 1 ?
            [e.nativeEvent.touches[0].pageX, e.nativeEvent.touches[0].pageY] : 
        [e.nativeEvent.pageX,e.nativeEvent.pageY];

    const getPointVectors = (a: number[], b: number[]) => [b[0] - a[0], b[1] - a[1]];
    const getPointDistance = (a: number, b: number) => Math.sqrt(a * a + b * b);
    const getTouchDistance = (e: GestureResponderEvent) => 
        e.nativeEvent.touches.length === 2 ? getPointDistance(e.nativeEvent.touches[0].pageX - e.nativeEvent.touches[1].pageX, e.nativeEvent.touches[0].pageY - e.nativeEvent.touches[1].pageY) : 0;


    const xRef = useRef(0);
    const yRef = useRef(0);
    const scaleRef = useRef(1);
    const touchCenterRef = useRef([0,0]);
    const touchDistanceRef = useRef(0);
    const touchMoveCount = useRef(0);

    const [profilePic, setProfilePic] = useState<string>();
    const [dirty, setDirty] = useState(false);

    const profilePicViewRef = useRef<View>(null);
    const viewShotRef = useRef<ViewShot>(null);

    useEffect(() => {
        if(user)
            setProfilePic(`${source.person.user(user.id)}?v=${ts}`);
    }, [user, ts]);

    const touchStart = (e: GestureResponderEvent) => {
        touchCenterRef.current = getTouchCenter(e);

        if(e.nativeEvent.touches.length === 1)
            touchMoveCount.current = 0;
    }

    const touchMove = (e: GestureResponderEvent) => {
        if(profilePic){
            const newCenter = getTouchCenter(e);
            
            const moved = getPointVectors(touchCenterRef.current, newCenter);

            if(e.nativeEvent.touches.length === 2){
                const bounds = Dimensions.get('window');
                const newDistance = getTouchDistance(e);
                const scale = touchDistanceRef.current === 0 ? 1 : newDistance / touchDistanceRef.current;
                touchDistanceRef.current = newDistance;

                scaleRef.current = scaleRef.current * scale;

                if(scale !== 1 && !dirty){
                    setDirty(true);
                    onDirty && onDirty(true);
                }
            }
            
            touchCenterRef.current = newCenter;
            
            xRef.current = xRef.current + moved[0];
            yRef.current = yRef.current + moved[1];

            touchMoveCount.current = touchMoveCount.current + 1;

            profilePicViewRef.current?.setNativeProps({transform: getTransform()});

            if((moved[0] !== 0 || moved[1] !== 0) && !dirty){
                setDirty(true);
                onDirty && onDirty(true);
            }
        }
    }

    const touchEnd = async (e: GestureResponderEvent) => {
        touchCenterRef.current = getTouchCenter(e);
        touchDistanceRef.current = 0;

        if(touchMoveCount.current < 1){
            const permission = await dispatch(getPermission({required: true, request: null, permission: 'images'})).unwrap();
            if(permission){
                launchImageLibrary({
                    mediaType: 'photo'}, photo => {
                    if(photo.assets?.length === 1){
                        setProfilePic(photo.assets![0].uri);
                        setDirty(true);
                        onDirty && onDirty(true);
                    }
                });
            }
        }
    }
    
    const getTransform = () => [{translateX: xRef.current}, {translateY: yRef.current}, {scale: scaleRef.current}];

    const capture = async () => await viewShotRef.current!.capture!();

    useImperativeHandle(ref, () => ({save: async () => {
        try{
            const tmpFile = await capture();

            const _file = await axios.get(tmpFile, {responseType: 'arraybuffer'});
    
            await fetch(api.baseUrl + `/api/photo/user/${user!.id}`, {
                method: 'post',
                body: _file.data,
                headers: {...api.getHeaders(), 'Content-Type': 'multipart/form-data'}
            });
            
            dispatch(updatePhotoTimestamp(Date.now()));
    
            await RNFS.unlink(tmpFile);
        }
        catch(e){
            console.log('profile pic save fail', e);
        }
    }}), [user]);

    if(!user)
        return <View></View>;

    return <View onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} style={{width: 300, height: 300, alignItems: 'center', justifyContent: 'center'}}>
        {
            (Platform.OS === 'ios' && !user.imageUrl) ? 
            <View style={{width: 235, height: 235, borderRadius: 235/2, borderStyle: 'solid', borderColor: '#FCFAEE', borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}>
                <ViewShot ref={viewShotRef} style={{width: '100%', height: '100%'}}>
                    {
                        (!!profilePic || user.signInStep > 1) &&
                        <View ref={profilePicViewRef} style={{position: 'absolute', width: 235, height: 235, transform: getTransform()}}>
                            <Image 
                                source={{uri: profilePic, headers: api.getHeaders()}} style={{width: '100%', height: '100%'}}
                                onLoad={() => {
                                    if(profilePic){
                                        setDirty(true);
                                        onDirty && onDirty(true);
                                    }
                                }}
                                onError={e => {
                                    setProfilePic('');
                                }}
                            />
                        </View>
                    }
                </ViewShot>
                <Svg style={{position: 'absolute', top: (235 - 24)/2, left: (235 - 24)/2 }}>
                    <Path d="M0 12 L24 12" stroke="#FCFAEE" strokeWidth="2"></Path>
                    <Path d="M12 0 L12 24" stroke="#FCFAEE" strokeWidth="2"></Path>
                </Svg>
            </View> :
            <UserAvatar size={150} />
        }
        
    </View>
}

export default forwardRef(ProfilePicViewShot);