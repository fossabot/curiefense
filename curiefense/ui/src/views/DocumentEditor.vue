<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <div class="columns">
            <div class="column">
              <div class="field is-grouped">
                <div class="control">
                  <div class="select is-small">
                    <select v-model="selectedBranch" @change="switchBranch" class="branch-selection">
                      <option v-for="name in branchNames" :key="name" :value="name">{{ name }}</option>
                    </select>
                  </div>
                </div>
                <div class="control">
                  <div class="select is-small">
                    <select v-model="selectedDocType" @change="switchDocType()" class="doc-type-selection">
                      <option v-for="(component, propertyName) in componentsMap" :key="propertyName"
                              :value="propertyName">{{ component.title }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="control">
                  <span class="icon is-small">
                    <i class="mdi mdi-dark mdi-source-branch"></i>
                  </span>
                  <span class="is-size-7 git-branches">{{ branches }} branches</span>
                </div>
                <div class="control">
                  <span class="icon is-small">
                    <i class="mdi mdi-dark mdi-source-commit"></i>
                  </span>
                  <span class="is-size-7 git-commits">{{ commits }} commits</span>
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field is-grouped is-pulled-right">
                <div class="control">
                  <div class="select is-small">
                    <select v-model="selectedDocID" @change="loadGitLog()" class="doc-selection">
                      <option v-for="pair in docIdNames" :key="pair[0]" :value="pair[0]">{{ pair[1] }}</option>
                    </select>
                  </div>
                </div>

                <p class="control"
                   v-if="selectedDocType !== 'wafsigs'">
                  <button class="button is-small fork-document-button"
                          @click="forkDoc"
                          title="Duplicate Document"
                          :disabled="!selectedDoc.name">
                    <span class="icon is-small">
                      <i class="fas fa-clone"></i>
                    </span>
                  </button>
                </p>

                <p class="control">
                  <a class="button is-small"
                     @click="downloadDoc"
                     title="Download Document x">
                    <span class="icon is-small">
                      <i class="fas fa-download"></i>
                    </span>

                  </a>
                </p>

                <p class="control"
                   v-if="selectedDocType !== 'wafsigs'">
                  <button class="button is-small new-document-button"
                          @click="addNewDoc()"
                          title="Add New Document">
                    <span class="icon is-small">
                      <i class="fas fa-plus"></i>
                    </span>
                  </button>
                </p>

                <p class="control"
                   v-if="selectedDocType !== 'wafsigs'">
                  <button class="button is-small save-document-button"
                          @click="saveChanges()"
                          title="Save changes">
                    <span class="icon is-small">
                      <i class="fas fa-save"></i>
                    </span>
                  </button>
                </p>

                <p class="control"
                   v-if="selectedDocType !== 'wafsigs'">
                  <button class="button is-small has-text-danger delete-document-button"
                          @click="deleteDoc"
                          title="Delete Document"
                          :disabled="selectedDoc.id === '__default__' || isDocReferenced || docs.length <= 1">
                    <span class="icon is-small">
                      <i class="fas fa-trash"></i>
                    </span>
                  </button>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <hr/>
        <component
            :is="currentEditorComponent.component"
            :selectedBranch.sync="selectedBranch"
            :selectedDoc.sync="selectedDoc"
            :docs.sync="docs"
            :apiPath="documentAPIPath"
            @switchDocType="switchDocType"
            ref="currentComponent"
        ></component>
        <hr/>
        <git-history v-if="selectedDocID"
                    :gitLog.sync="gitLog"
                    :apiPath.sync="gitAPIPath"
                    @restoreVersion="restoreGitVersion"></git-history>
      </div>
    </div>
  </div>
</template>

<script>

import DatasetsUtils from '@/assets/DatasetsUtils.js'
import ACLEditor from '@/doc-editors/ACLEditor.vue'
import WAFEditor from '@/doc-editors/WAFEditor.vue'
import WAFSigsEditor from '@/doc-editors/WAFSigsEditor.vue'
import URLMapsEditor from '@/doc-editors/URLMapsEditor.vue'
import RateLimitsEditor from '@/doc-editors/RateLimitsEditor.vue'
import ProfilingListEditor from '@/doc-editors/ProfilingListEditor.vue'
import GitHistory from '@/components/GitHistory.vue'
import RequestsUtils from '@/assets/RequestsUtils'

export default {

  name: 'DocumentEditor',
  props: {},
  components: {
    GitHistory
  },
  data() {
    return {
      configs: [],

      // To prevent deletion of docs referenced by URLmaps
      referencedIDsACL: [],
      referencedIDsWAF: [],
      referencedIDsLimits: [],

      // ...
      selectedBranch: null,
      branchDocTypes: null,
      selectedDocType: null,

      docs: [],
      docIdNames: [],
      selectedDocID: null,

      gitLog: [],
      commits: 0,
      branches: 0,

      componentsMap: {
        'aclprofiles': {component: ACLEditor, title: 'ACL Profiles'},
        'profilinglists': {component: ProfilingListEditor, title: 'Profiling Lists'},
        'limits': {component: RateLimitsEditor, title: 'Rate Limits'},
        'urlmaps': {component: URLMapsEditor, title: 'URL Maps'},
        'wafprofiles': {component: WAFEditor, title: 'WAF Profiles'},
        'wafsigs': {component: WAFSigsEditor, title: 'WAF Signatures'},
      },

      apiRoot: DatasetsUtils.ConfAPIRoot,
      apiVersion: DatasetsUtils.ConfAPIVersion,

    }
  },
  computed: {

    documentAPIPath() {
      return `${this.apiRoot}/${this.apiVersion}/configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`
    },

    gitAPIPath() {
      return `${this.apiRoot}/${this.apiVersion}/configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/v/`
    },

    branchNames() {
      return this.ld.sortBy(this.ld.map(this.configs, 'id'))
    },

    currentEditorComponent() {
      if (this.selectedDocType) {
        return this.componentsMap[this.selectedDocType]
      } else {
        return Object.values(this.componentsMap)[0]
      }
    },

    selectedDoc: {
      get() {
        return this.docs[this.selectedDocIndex] || {}
      },
      set(newDoc) {
        this.$set(this.docs, this.selectedDocIndex, newDoc)
      }
    },

    selectedDocIndex() {
      if (this.selectedDocID) {
        return this.ld.findIndex(this.docs, (doc) => {
          return doc.id === this.selectedDocID
        })
      }
      return 0
    },

    isDocReferenced() {
      if (this.selectedDocType === 'aclprofiles') {
        return this.referencedIDsACL.includes(this.selectedDocID)
      }
      if (this.selectedDocType === 'wafprofiles') {
        return this.referencedIDsWAF.includes(this.selectedDocID)
      }
      if (this.selectedDocType === 'limits') {
        return this.referencedIDsLimits.includes(this.selectedDocID)
      }
      return false
    }

  },

  methods: {

    resetGitLog() {
      this.gitLog = []
    },

    newDoc() {
      let factory = DatasetsUtils.NewDocEntryFactory[this.selectedDocType]
      return factory && factory()
    },

    async loadConfigs(counter_only) {
      // store configs
      const response = await RequestsUtils.sendRequest('GET', 'configs/')
      let configs = response.data
      if (!counter_only) {
        console.log('this.configs', configs)
        this.configs = configs
        // pick first branch name as selected
        this.selectedBranch = this.branchNames[0]
        // get branch document types
        this.initDocTypes()
      }
      // counters
      this.commits = this.ld.sum(this.ld.map(this.ld.map(configs, 'logs'), (logs) => {
        return this.ld.size(logs)
      }))
      this.branches = this.ld.size(configs)
      console.log('config counters', this.branches, this.commits)
    },

    initDocTypes() {
      let doctype = this.selectedDocType = Object.keys(this.componentsMap)[0]
      this.loadDocs(doctype)
    },

    updateDocIdNames() {
      this.docIdNames = this.ld.sortBy(this.ld.map(this.docs, (doc) => {
            return [doc.id, doc.name]
          }),
          (entry) => {
            return entry[1]
          })
    },

    loadDocs(doctype) {
      let branch = this.selectedBranch
      RequestsUtils.sendRequest('GET', `configs/${branch}/d/${doctype}/`).then((response) => {
        this.docs = response.data
        this.updateDocIdNames()
        if (this.docIdNames && this.docIdNames.length && this.docIdNames[0].length) {
          this.selectedDocID = this.docIdNames[0][0]
        }
        this.loadGitLog()
      })
    },

    loadGitLog(interaction) {
      let config = this.selectedBranch,
          document_ = this.selectedDocType,
          entry = this.selectedDocID,
          url_trail = `configs/${config}/d/${document_}/e/${entry}/v/`

      if (config && document_ && entry) {
        RequestsUtils.sendRequest('GET', url_trail).then((response) => {
          this.gitLog = response.data
          if (interaction) {
            this.loadConfigs(true)
          }
        })
      }

    },

    switchBranch() {
      this.resetGitLog()
      this.initDocTypes()
      this.loadReferencedDocsIDs()
    },

    switchDocType(docType) {
      if (!docType) {
        docType = this.selectedDocType
      } else {
        this.selectedDocType = docType
      }
      this.docs = []
      this.selectedDocID = null
      this.resetGitLog()
      this.loadDocs(docType)
    },

    downloadDoc() {
      let element = event.target
      while (element.nodeName !== 'A')
        element = element.parentNode

      let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.docs))
      element.setAttribute('href', dataStr)
      element.setAttribute('download', this.selectedDocType + '.json')
    },

    forkDoc() {
      let new_doc = this.ld.cloneDeep(this.selectedDoc)
      new_doc.name = 'copy of ' + new_doc.name
      new_doc.id = DatasetsUtils.UUID2()
      this.addNewDoc(new_doc)
    },

    addNewDoc(new_doc) {
      if (!new_doc) {
        new_doc = this.newDoc()
      }
      this.resetGitLog()
      this.docs.unshift(new_doc)
      this.selectedDocID = new_doc.id
      this.saveChanges('POST')
    },

    saveChanges(methodName) {
      if (!methodName) {
        methodName = 'PUT'
      }
      let url_trail = `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/`
      if (methodName !== 'POST')
        url_trail += `${this.selectedDocID}/`
      const doc = this.selectedDoc

      RequestsUtils.sendRequest(methodName, url_trail, doc, 'Changes saved!', 'Failed while saving changes!')
          .then(() => {
            this.updateDocIdNames()
            this.loadGitLog(true)
            // If the saved doc was a urlmap, refresh the referenced IDs lists
            if (this.selectedDocType === 'urlmaps') {
              this.loadReferencedDocsIDs()
            }
          })
    },

    deleteDoc() {
      this.docs.splice(this.selectedDocIndex, 1)
      RequestsUtils.sendRequest('DELETE', `configs/${this.selectedBranch}/d/${this.selectedDocType}/e/${this.selectedDocID}/`, null, 'Document deleted!', 'Failed while deleting document!')
          .then(() => {
            this.updateDocIdNames()
          })
      this.selectedDocID = this.docs[0].id
      this.resetGitLog()
    },

    async loadReferencedDocsIDs() {
      const response = await RequestsUtils.sendRequest('GET', `configs/${this.selectedBranch}/d/urlmaps/`)
      const docs = response.data
      const referencedACL = []
      const referencedWAF = []
      const referencedLimit = []
      this.ld.forEach(docs, (doc) => {
        this.ld.forEach(doc.map, (mapEntry) => {
          referencedACL.push(mapEntry['acl_profile'])
          referencedWAF.push(mapEntry['waf_profile'])
          referencedLimit.push(mapEntry['limit_ids'])
        })
      })
      this.referencedIDsACL = this.ld.uniq(referencedACL)
      this.referencedIDsWAF = this.ld.uniq(referencedWAF)
      this.referencedIDsLimits = this.ld.uniq(this.ld.flatten(referencedLimit))
    },

    async restoreGitVersion(gitVersion) {
      const branch = this.selectedBranch
      const doctype = this.selectedDocType
      const docTitle = this.componentsMap[doctype].title
      const version_id = gitVersion.version
      const url_trail = `configs/${branch}/d/${doctype}/v/${version_id}/`

      await RequestsUtils.sendRequest('PUT', `${url_trail}revert/`, null, `Document [${docTitle}] restored to version [${version_id}]!`, `Failed restoring document [${docTitle}] to version [${version_id}]!`)
      const response = await RequestsUtils.sendRequest('GET', url_trail)
      this.docs = response.data
      this.updateDocIdNames()
      this.loadGitLog()
    },
  },

  async created() {
    await this.loadConfigs()
    this.loadReferencedDocsIDs()
  }

}

</script>
