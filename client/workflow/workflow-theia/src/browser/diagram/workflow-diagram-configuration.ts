/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import "sprotty-theia/css/theia-sprotty.css";

import { createWorkflowDiagramContainer } from "@eclipse-glsp-examples/workflow-sprotty/lib";
import { CommandPalette, TYPES } from "@eclipse-glsp/client";
import { ExternalNavigateToTargetHandler } from "@eclipse-glsp/client/lib";
import { TheiaCommandPalette, TheiaContextMenuService } from "@eclipse-glsp/theia-integration/lib/browser";
import {
    connectTheiaContextMenuService,
    TheiaContextMenuServiceFactory
} from "@eclipse-glsp/theia-integration/lib/browser/diagram/glsp-theia-context-menu-service";
import {
    connectTheiaMarkerManager,
    TheiaMarkerManager,
    TheiaMarkerManagerFactory
} from "@eclipse-glsp/theia-integration/lib/browser/diagram/glsp-theia-marker-manager";
import { TheiaNavigateToTargetHandler } from "@eclipse-glsp/theia-integration/lib/browser/theia-navigate-to-target-handler";
import { SelectionService } from "@theia/core";
import { Container, inject, injectable } from "inversify";
import { DiagramConfiguration, TheiaDiagramServer, TheiaSprottySelectionForwarder } from "sprotty-theia";

import { WorkflowLanguage } from "../../common/workflow-language";
import { WorkflowDiagramServer } from "./workflow-diagram-server";

@injectable()
export class WorkflowDiagramConfiguration implements DiagramConfiguration {

    @inject(SelectionService) protected selectionService: SelectionService;
    @inject(TheiaNavigateToTargetHandler) protected navigateToTargetHandler: TheiaNavigateToTargetHandler;
    @inject(TheiaContextMenuServiceFactory) protected readonly contextMenuServiceFactory: () => TheiaContextMenuService;
    @inject(TheiaMarkerManagerFactory) protected readonly theiaMarkerManager: () => TheiaMarkerManager;

    diagramType: string = WorkflowLanguage.DiagramType;

    createContainer(widgetId: string): Container {
        const container = createWorkflowDiagramContainer(widgetId);
        container.bind(TYPES.ModelSource).to(WorkflowDiagramServer).inSingletonScope();
        container.bind(TheiaDiagramServer).toService(WorkflowDiagramServer);
        // container.rebind(KeyTool).to(TheiaKeyTool).inSingletonScope()
        container.bind(TYPES.IActionHandlerInitializer).to(TheiaSprottySelectionForwarder);
        container.bind(SelectionService).toConstantValue(this.selectionService);
        container.bind(ExternalNavigateToTargetHandler).toConstantValue(this.navigateToTargetHandler);
        container.rebind(CommandPalette).to(TheiaCommandPalette);
        connectTheiaContextMenuService(container, this.contextMenuServiceFactory);
        connectTheiaMarkerManager(container, this.theiaMarkerManager, this.diagramType);
        return container;
    }
}
