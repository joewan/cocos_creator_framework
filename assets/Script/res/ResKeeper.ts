import { resLoader, CompletedCallback } from "./ResLoader";
/**
 * 资源引用类
 * 1. 提供加载功能，并记录加载过的资源
 * 2. 在node释放时自动清理加载过的资源
 * 3. 支持手动添加记录
 * 
 * 2019-12-13 by 宝爷
 */
const {ccclass, property} = cc._decorator;

/** 自动释放配置 */
interface autoResInfo {
    url: string;
    use?: string;
    type: typeof cc.Asset;
};

@ccclass
export default class ResKeeper extends cc.Component {

    private autoRes: autoResInfo[] = [];

   /**
     * 获取该界面的资源占用key
     */
    public getUseKey(): string {
        return "";
    }

    /**
     * 加载资源，通过此接口加载的资源会在界面被销毁时自动释放
     * 如果同时有其他地方引用的资源，会解除当前界面对该资源的占用
     * @param url 要加载的url
     * @param type 类型，如cc.Prefab,cc.SpriteFrame,cc.Texture2D
     * @param onCompleted 
     */
    public loadRes(url: string, type: typeof cc.Asset, onCompleted: CompletedCallback) {
        let useStr = this.getUseKey();
        resLoader.loadRes(url, type, (error: Error, res) => {
            if (!error) {
                this.autoRes.push({ url: url, type: type });
            }
            onCompleted && onCompleted(error, res);
        }, useStr);
    }

    /**
     * 释放资源，界面销毁时在UIManager中调用
     */
    public releaseAutoRes() {
        for (let index = 0; index < this.autoRes.length; index++) {
            const element = this.autoRes[index];
            resLoader.releaseRes(element.url,
                element.type, element.use || this.getUseKey());
        }
    }

    /**
     * 往一个界面加入一个自动释放的资源
     * @param resConf 资源url和类型
     */
    public autoReleaseRes(resConf: autoResInfo) {
        this.autoRes.push(resConf);
    }
}
