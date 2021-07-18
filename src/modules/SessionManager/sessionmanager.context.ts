import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as asyncHooks from 'async_hooks';
import { SessionContext } from '../../core';
import { SessionManagerException } from './sessionmanager.exception';
import { SessionManagerHelper } from './sessionmanager.helper';
import { SessionManagerStorage } from './sessionmanager.storage';

//TODO: @michaelsogos:
//1. Is possible to improve the weight on HEAP MEMORY using, on internal MAP, just a random\uuid word. Then saving object in a parallel map that exists once
//2. Add an HAS method to check if a MAP KEY exists before call GET
//3. Investigate if MAP is garbageable when KEY is removed or not
export class SessionManagerContext implements OnModuleInit, OnModuleDestroy {
    public static getInstance(): SessionManagerContext {
        if (!this.instance) {
            this.initialize();
        }
        return this.instance;
    }

    private static instance: SessionManagerContext;

    private static initialize() {
        const asyncHooksStorage = new SessionManagerStorage();
        const asyncHook = SessionManagerHelper.createHooks(asyncHooksStorage);
        const storage = asyncHooksStorage.getInternalStorage();

        this.instance = new SessionManagerContext(storage, asyncHook);
    }

    private constructor(private readonly internalStorage: Map<number, any>, private readonly asyncHookRef: asyncHooks.AsyncHook) {}

    public onModuleInit() {
        this.asyncHookRef.enable();
    }

    public onModuleDestroy() {
        this.asyncHookRef.disable();
    }

    public set(key: string, value: any) {
        const store = this.getAsyncStorage();
        store.set(key, value);
    }

    public get<TReturnValue = any>(key: string): TReturnValue {
        const store = this.getAsyncStorage();
        return store.get(key) as TReturnValue;
    }

    public run(fn: Function) {
        const eid = asyncHooks.executionAsyncId();
        this.internalStorage.set(eid, new Map());
        fn();
    }

    private getAsyncStorage(): Map<string, any> {
        const eid = asyncHooks.executionAsyncId();
        const state = this.internalStorage.get(eid);
        if (!state) {
            throw new SessionManagerException(eid);
        }
        return state;
    }

    public getContext() {
        return this.get<SessionContext>('context');
    }
}
