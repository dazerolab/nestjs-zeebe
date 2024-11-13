import { Camunda8 } from '@camunda8/sdk';
import { Camunda8ClientConfiguration } from '@camunda8/sdk/dist/lib';
import { ZeebeGrpcClient } from '@camunda8/sdk/dist/zeebe';
import { Module, OnModuleDestroy, DynamicModule, Provider, Logger } from '@nestjs/common';

@Module({})
export class ZeebeModule implements OnModuleDestroy {
    public static forRoot(options: Camunda8ClientConfiguration): DynamicModule {
        const optionsProviders: Provider[] = [];
        optionsProviders.push(this.createOptionsProvider(options));

        const connectionProviders: Provider[] = [];
        connectionProviders.push(this.createConnectionProvider());

        return {
            module: ZeebeModule,
            providers: [...optionsProviders, ...connectionProviders],
            exports: connectionProviders
        };
    }

    private static createOptionsProvider(options: Camunda8ClientConfiguration): Provider {
        return {
            provide: 'ZEEBE_OPTIONS_PROVIDER',
            useValue: options
        };
    }

    private static createConnectionProvider(): Provider {
        return {
            provide: ZeebeGrpcClient,
            useFactory: async (options: Camunda8ClientConfiguration) => {
                const c8 = new Camunda8(options);
                const zeebe = c8.getZeebeGrpcApiClient();

                return zeebe;
            },
            inject: ['ZEEBE_OPTIONS_PROVIDER']
        };
    }

    onModuleDestroy() {
        Logger.error('Zeebe Module destroyed');
    }
}
